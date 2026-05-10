import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api'

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true)
        try {
            console.log('Login request values:', values)
            const res: any = await authApi.login(values)
            console.log('Login response:', res)
            const token = res.accessToken || (res.data?.accessToken)
            console.log('Token to save:', token)
            if (token) {
                localStorage.setItem('token', token)
                console.log('Token saved to localStorage:', token)
                console.log('Token in localStorage after save:', localStorage.getItem('token'))
                message.success('🎉 登录成功！欢迎回来')
                navigate('/dashboard')
            } else {
                console.error('No token found in response')
                message.error('登录失败：未获取到token')
            }
        } catch (error: any) {
            console.error('Login error:', error)
            message.error(error.response?.data?.message || '登录失败，请检查账号和密码')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #e8f5e9 100%)',
            padding: '40px 20px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(144, 202, 249, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                top: '-200px',
                left: '-200px',
                animation: 'float 8s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(206, 147, 216, 0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                bottom: '-150px',
                right: '-150px',
                animation: 'float 10s ease-in-out infinite reverse',
            }} />
            
            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '440px',
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px',
                }}>
                    <div style={{
                        fontSize: '72px',
                        marginBottom: '20px',
                        animation: 'bounce 2s ease-in-out infinite',
                    }}>
                        🎓
                    </div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#1e3a5f',
                        marginBottom: '8px',
                        letterSpacing: '1px',
                    }}>
                        教育质量监测系统
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: '#5c7998',
                        fontWeight: 400,
                    }}>
                        用心守护每一份教育质量
                    </p>
                </div>
                
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '28px',
                    padding: '40px 36px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)',
                }}>
                    <Form
                        name="login"
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                        layout="vertical"
                    >
                        <Form.Item
                            name="username"
                            label="账号"
                            rules={[{ required: true, message: '请输入账号' }]}
                        >
                            <Input 
                                prefix={<UserOutlined style={{ color: '#64b5f6' }} />} 
                                placeholder="请输入您的账号"
                                style={{
                                    borderRadius: '14px',
                                    height: '52px',
                                    fontSize: '15px',
                                    border: '2px solid #e3f2fd',
                                    transition: 'all 0.3s ease',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#64b5f6';
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(100, 181, 246, 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#e3f2fd';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined style={{ color: '#64b5f6' }} />} 
                                placeholder="请输入您的密码"
                                style={{
                                    borderRadius: '14px',
                                    height: '52px',
                                    fontSize: '15px',
                                    border: '2px solid #e3f2fd',
                                    transition: 'all 0.3s ease',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#64b5f6';
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(100, 181, 246, 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#e3f2fd';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginTop: '32px', marginBottom: '20px' }}>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading} 
                                block
                                style={{
                                    height: '54px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
                                    boxShadow: '0 8px 24px rgba(100, 181, 246, 0.4)',
                                    border: 'none',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(100, 181, 246, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(100, 181, 246, 0.4)';
                                }}
                            >
                                {loading ? '登录中...' : '🚀 立即登录'}
                            </Button>
                        </Form.Item>

                        <div style={{ 
                            textAlign: 'center', 
                            color: '#8fa6c0',
                            fontSize: '13px',
                            background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.1) 0%, rgba(206, 147, 216, 0.1) 100%)',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            border: '1px dashed rgba(144, 202, 249, 0.3)',
                        }}>
                            <p style={{ margin: 0 }}>💡 测试账号: <strong style={{ color: '#1e3a5f' }}>admin</strong> / <strong style={{ color: '#1e3a5f' }}>admin123</strong></p>
                        </div>
                    </Form>
                </div>
                
                <div style={{
                    textAlign: 'center',
                    marginTop: '32px',
                    color: '#8fa6c0',
                    fontSize: '13px',
                }}>
                    <p>© 2024 教育质量监测系统 · 用心守护教育品质</p>
                </div>
            </div>
            
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(30px, -30px); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    )
}

export default Login