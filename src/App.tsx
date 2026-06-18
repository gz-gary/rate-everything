import { useState } from 'react'
import {
  Layout,
  Typography,
  Card,
  Statistic,
  Button,
  Space,
  Row,
  Col,
  Tag,
  List,
  Avatar,
  ConfigProvider,
} from 'antd'
import {
  ArrowUpOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CloudOutlined,
} from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title, Paragraph, Text } = Typography

const features = [
  {
    icon: <AppstoreOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    title: 'Project Management',
    description: 'Organize and track your projects with ease using our intuitive dashboard.',
  },
  {
    icon: <UserOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    title: 'Team Collaboration',
    description: 'Work together in real-time with your team members across the globe.',
  },
  {
    icon: <CloudOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    title: 'Cloud Sync',
    description: 'Access your data anywhere, anytime with automatic cloud synchronization.',
  },
  {
    icon: <SettingOutlined style={{ fontSize: 28, color: '#1677ff' }} />,
    title: 'Customizable Workflow',
    description: 'Tailor the platform to fit your unique workflow and business needs.',
  },
]

const recentActivities = [
  { user: 'Alice', action: 'completed task', target: 'Design Review', time: '2 min ago' },
  { user: 'Bob', action: 'uploaded file', target: 'Q4 Report.pdf', time: '15 min ago' },
  { user: 'Charlie', action: 'commented on', target: 'Homepage Redesign', time: '1 hour ago' },
  { user: 'Diana', action: 'joined', target: 'Marketing Team', time: '3 hours ago' },
  { user: 'Eve', action: 'deployed', target: 'v2.1.0 to production', time: '5 hours ago' },
]

function App() {
  const [currentYear] = useState(new Date().getFullYear())

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
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#001529',
            padding: '0 48px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RiseOutlined style={{ fontSize: 24, color: '#fff' }} />
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              RateEverything
            </Title>
          </div>
          <Space size="middle">
            <Button type="text" style={{ color: '#fff' }}>Dashboard</Button>
            <Button type="text" style={{ color: '#fff' }}>Projects</Button>
            <Button type="text" style={{ color: '#fff' }}>Team</Button>
            <Button type="primary" ghost>Get Started</Button>
          </Space>
        </Header>

        <Content style={{ padding: '0 48px' }}>
          {/* Hero Section */}
          <div
            style={{
              textAlign: 'center',
              padding: '80px 0 48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 16,
              margin: '24px 0',
            }}
          >
            <Title level={1} style={{ color: '#fff', margin: 0 }}>
              Welcome to RateEverything
            </Title>
            <Paragraph
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 18,
                maxWidth: 600,
                margin: '16px auto 32px',
              }}
            >
              A modern platform for rating, reviewing, and discovering the best products and
              services. Start exploring today!
            </Paragraph>
            <Space size="large">
              <Button type="primary" size="large" style={{ height: 48, paddingInline: 32 }}>
                Get Started
              </Button>
              <Button size="large" ghost style={{ height: 48, paddingInline: 32, color: '#fff', borderColor: '#fff' }}>
                Learn More
              </Button>
            </Space>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="Active Users"
                  value={12846}
                  prefix={<UserOutlined />}
                  suffix={
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      <ArrowUpOutlined /> 11.2%
                    </Tag>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="Total Orders"
                  value={3824}
                  prefix={<ShoppingCartOutlined />}
                  suffix={
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      <ArrowUpOutlined /> 8.5%
                    </Tag>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="Revenue"
                  value={56123}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix={
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      <ArrowUpOutlined /> 5.8%
                    </Tag>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="Growth Rate"
                  value={23.5}
                  precision={1}
                  prefix={<RiseOutlined />}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>

          {/* Features Section */}
          <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
            Key Features
          </Title>
          <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', height: '100%' }}
                >
                  <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph type="secondary">{feature.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Recent Activity Section */}
          <Row gutter={24} style={{ marginBottom: 48 }}>
            <Col xs={24} lg={16}>
              <Card title="Recent Activity" style={{ height: '100%' }}>
                <List
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: '#1677ff' }}>
                            {item.user[0]}
                          </Avatar>
                        }
                        title={
                          <Text>
                            <Text strong>{item.user}</Text> {item.action}{' '}
                            <Text strong>{item.target}</Text>
                          </Text>
                        }
                        description={item.time}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Quick Actions" style={{ height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Button block type="primary" icon={<UserOutlined />}>
                    Add New User
                  </Button>
                  <Button block icon={<ShoppingCartOutlined />}>
                    Create Order
                  </Button>
                  <Button block icon={<DollarOutlined />}>
                    Generate Report
                  </Button>
                  <Button block icon={<SettingOutlined />}>
                    Settings
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>

        <Footer
          style={{
            textAlign: 'center',
            background: '#f5f5f5',
            padding: '24px 48px',
          }}
        >
          <Paragraph type="secondary" style={{ margin: 0 }}>
            RateEverything ©{currentYear} — Built with Vite + React + TypeScript + Ant Design
          </Paragraph>
        </Footer>
      </Layout>
    </ConfigProvider>
  )
}

export default App
