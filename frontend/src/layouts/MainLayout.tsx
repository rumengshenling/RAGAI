import { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, theme } from 'antd'
import {
    DashboardOutlined,
    DatabaseOutlined,
    WarningOutlined,
    MessageOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout

interface MainLayoutProps {
    children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { token: { borderRadiusLG } } = theme.useToken()

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: '驾驶舱',
        },
        {
            key: '/data-collection',
            icon: <DatabaseOutlined />,
            label: '数据采集',
        },
        {
            key: '/early-warning',
            icon: <WarningOutlined />,
            label: '预警分析',
        },
        {
            key: '/knowledge-qa',
            icon: <MessageOutlined />,
            label: '智能问答',
        },
    ]

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: '个人中心',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            danger: true,
        },
    ]

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key)
    }

    const handleUserMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            localStorage.removeItem('token')
            window.location.href = '/login'
        } else if (key === 'profile') {
            navigate('/profile')
        }
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    background: 'linear-gradient(180deg, #1e3a5f 0%, #2c5f8f 100%)',
                    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.1)',
                }}
            >
                <div style={{
                    height: 72,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: collapsed ? 16 : 20,
                    fontWeight: 600,
                    letterSpacing: 1,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}>
                    {collapsed ? '🎓' : '🎓 教育质量监测'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        borderRight: 'none',
                        background: 'transparent',
                        paddingTop: 12,
                    }}
                />
            </Sider>
            <Layout style={{ background: 'transparent' }}>
                <Header style={{
                    padding: '0 32px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    height: 72,
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: 18,
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(144, 202, 249, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    />
                    <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
                        <div style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '8px 16px',
                            borderRadius: 16,
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(144, 202, 249, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                        >
                            <Avatar
                                style={{
                                    background: 'linear-gradient(135deg, #64b5f6, #ba68c8)',
                                    boxShadow: '0 4px 12px rgba(100, 181, 246, 0.4)',
                                }}
                                size={42}
                                icon={<UserOutlined />}
                            />
                            <span style={{
                                fontWeight: 500,
                                color: '#1e3a5f',
                                fontSize: 15,
                            }}>管理员</span>
                        </div>
                    </Dropdown>
                </Header>
                <Content style={{
                    margin: '24px 24px',
                    padding: 32,
                    minHeight: 280,
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: 20,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}

export default MainLayout