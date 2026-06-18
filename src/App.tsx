import { useEffect, useState, useCallback } from 'react'
import {
  Layout,
  Typography,
  Card,
  Button,
  Space,
  Table,
  Tag,
  Rate,
  Modal,
  Form,
  Input,
  message,
  Skeleton,
  Empty,
  Result,
  ConfigProvider,
  Flex,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  RiseOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { ratingsApi, type Rating } from './api/client'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography
const { TextArea } = Input

// ---------- Star rating labels ----------

const ratingLabels: Record<number, string> = {
  1: 'Terrible',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
}

// ---------- Color mapping for categories ----------

const categoryColors: Record<string, string> = {
  Framework: 'blue',
  Language: 'purple',
  Tool: 'cyan',
  'UI Library': 'geekblue',
  Database: 'orange',
}

// ---------- Component ----------

function App() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  // ---- Data fetching ----

  // 初始加载：只在 mount 时跑一次，不设 loading=true（已经是初始值）
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await ratingsApi.list()
        if (!cancelled) setRatings(data)
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load ratings'
          setError(msg)
          message.error(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // 手动刷新（用户点击 Refresh 按钮）
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ratingsApi.list()
      setRatings(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load ratings'
      setError(msg)
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  // ---- Create rating ----

  const handleCreate = async (values: {
    item: string
    category?: string
    rating: number
    comment?: string
  }) => {
    setSubmitting(true)
    try {
      await ratingsApi.create({
        item: values.item,
        category: values.category || '',
        rating: values.rating,
        comment: values.comment || undefined,
      })
      message.success(`Rated "${values.item}" successfully!`)
      setModalOpen(false)
      form.resetFields()
      refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create rating'
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Delete rating ----

  const handleDelete = async (id: number, item: string) => {
    try {
      await ratingsApi.delete(id)
      message.success(`Deleted "${item}"`)
      refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete'
      message.error(msg)
    }
  }

  // ---- Table columns ----

  const columns = [
    {
      title: 'Item',
      dataIndex: 'item',
      key: 'item',
      width: 200,
      render: (text: string, record: Rating) => (
        <Flex vertical gap={4}>
          <Text strong>{text}</Text>
          <Tag color={categoryColors[record.category] || 'default'}>
            {record.category || 'Uncategorized'}
          </Tag>
        </Flex>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 220,
      render: (rating: number) => (
        <Flex vertical align="center" gap={2}>
          <Rate disabled value={rating} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {ratingLabels[rating]}
          </Text>
        </Flex>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (text: string | null) =>
        text ? (
          <Text italic>{text}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => (
        <Text type="secondary">
          {new Date(date + 'Z').toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: Rating) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id, record.item)}
        />
      ),
    },
  ]

  // ---- Render: error ----

  if (error && ratings.length === 0) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <HeaderStyle />
        <Content style={{ padding: '0 48px' }}>
          <Result
            status="error"
            title="Failed to load ratings"
            subTitle={error}
            extra={
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={refresh}
              >
                Retry
              </Button>
            }
          />
        </Content>
      </Layout>
    )
  }

  // ---- Render: main ----

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <HeaderStyle />

        <Content style={{ padding: '0 48px' }}>
          <Card style={{ margin: '24px 0' }}>
            <Flex justify="space-between" align="center">
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  All Ratings
                </Title>
                {!loading && (
                  <Text type="secondary">
                    {ratings.length} item{ratings.length !== 1 ? 's' : ''} rated
                  </Text>
                )}
              </div>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={refresh}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalOpen(true)}
                >
                  Rate Something
                </Button>
              </Space>
            </Flex>
          </Card>

          {/* Loading state */}
          {loading ? (
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          ) : /* Empty state */
          ratings.length === 0 ? (
            <Card>
              <Empty description="No ratings yet — be the first!" />
            </Card>
          ) : (
            /* Data table */
            <Card bodyStyle={{ padding: 0 }}>
              <Table
                dataSource={ratings}
                columns={columns}
                rowKey="id"
                pagination={false}
              />
            </Card>
          )}
        </Content>

        <FooterStyle />

        {/* ---- Create Modal ---- */}
        <Modal
          title="Rate Something"
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false)
            form.resetFields()
          }}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
            initialValues={{ rating: 5 }}
          >
            <Form.Item
              name="item"
              label="Item"
              rules={[{ required: true, message: 'Please enter the item name' }]}
            >
              <Input placeholder="e.g. React, VSCode, TypeScript..." />
            </Form.Item>

            <Form.Item name="category" label="Category">
              <Input placeholder="e.g. Framework, Tool, Language..." />
            </Form.Item>

            <Form.Item
              name="rating"
              label="Rating"
              rules={[{ required: true, message: 'Please select a rating' }]}
            >
              <Rate tooltips={Object.values(ratingLabels)} />
            </Form.Item>

            <Form.Item name="comment" label="Comment">
              <TextArea rows={3} placeholder="What do you think?" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Submit
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ConfigProvider>
  )
}

// ---------- Extracted header / footer (avoid repetition) ----------

function HeaderStyle() {
  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#001529',
        padding: '0 48px',
      }}
    >
      <Flex align="center" gap={12}>
        <RiseOutlined style={{ fontSize: 24, color: '#fff' }} />
        <Title level={4} style={{ margin: 0, color: '#fff' }}>
          RateEverything
        </Title>
      </Flex>
      <Button type="primary" ghost>
        Dashboard
      </Button>
    </Header>
  )
}

function FooterStyle() {
  return (
    <Footer
      style={{
        textAlign: 'center',
        background: '#f5f5f5',
        padding: '24px 48px',
      }}
    >
      <Text type="secondary">
        RateEverything ©{new Date().getFullYear()} — Built with Vite + React +
        TypeScript + Ant Design + Cloudflare D1
      </Text>
    </Footer>
  )
}

export default App
