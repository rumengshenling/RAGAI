import { useState } from 'react'
import { Card, Tabs, Form, Input, Button, Avatar, Descriptions, Tag, message, Divider } from 'antd'
import { UserOutlined, InfoCircleOutlined, QuestionCircleOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'

const { TabPane } = Tabs

const Profile: React.FC = () => {
    const [editing, setEditing] = useState(false)
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [personalInfo, setPersonalInfo] = useState({
        username: 'admin',
        name: '系统管理员',
        email: 'admin@education.edu.cn',
        phone: '138****8888',
        department: '教育质量监测中心',
        role: '系统管理员',
    })

    const handleSaveProfile = async () => {
        try {
            setLoading(true)
            const values = await form.validateFields()
            console.log('Profile updated:', values)
            setPersonalInfo(values)
            message.success('✨ 个人资料更新成功！')
            setEditing(false)
        } catch (error) {
            console.error('Validation failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const systemInfo = {
        version: '2.1.0',
        lastUpdate: '2024-03-18',
        developer: '教育技术研发团队',
        contact: 'support@education.edu.cn',
        description: '教育质量监测系统是一套基于人工智能技术的综合性教育管理平台，旨在为教育机构提供全方位的数据监测、预警分析和决策支持服务。',
    }

    return (
        <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '20px 0',
        }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '40px',
            }}>
                <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    style={{
                        background: 'linear-gradient(135deg, #64b5f6 0%, #ba68c8 100%)',
                        boxShadow: '0 12px 40px rgba(100, 181, 246, 0.4)',
                        marginBottom: '20px',
                    }}
                />
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#1e3a5f',
                    marginBottom: '8px',
                }}>
                    {personalInfo.name}
                </h2>
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {personalInfo.role}
                </Tag>
            </div>

            <Card
                style={{
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    overflow: 'hidden',
                }}
                bodyStyle={{ padding: 0 }}
            >
                <Tabs
                    defaultActiveKey="profile"
                    size="large"
                    style={{
                        padding: '0 24px',
                    }}
                    tabBarStyle={{
                        marginBottom: 0,
                        borderBottom: '2px solid #f0f0f0',
                    }}
                >
                    <TabPane
                        tab={
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <UserOutlined />
                                个人资料
                            </span>
                        }
                        key="profile"
                    >
                        <div style={{ padding: '32px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#1e3a5f',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                    <EditOutlined />
                                    编辑个人信息
                                </h3>
                                <Button
                                    type={editing ? 'default' : 'primary'}
                                    icon={editing ? '取消' : <EditOutlined />}
                                    onClick={() => {
                                        if (editing) {
                                            setEditing(false)
                                            form.setFieldsValue(personalInfo)
                                        } else {
                                            setEditing(true)
                                        }
                                    }}
                                    style={{
                                        borderRadius: '12px',
                                        height: '40px',
                                        padding: '0 20px',
                                    }}
                                >
                                    {editing ? '取消编辑' : '编辑资料'}
                                </Button>
                            </div>

                            <Form
                                form={form}
                                layout="vertical"
                                initialValues={personalInfo}
                                style={{ display: editing ? 'block' : 'none' }}
                            >
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '24px',
                                }}>
                                    <Form.Item
                                        label="账号"
                                        name="username"
                                        rules={[{ required: true, message: '请输入账号' }]}
                                    >
                                        <Input
                                            placeholder="请输入账号"
                                            style={{
                                                borderRadius: '12px',
                                                height: '48px',
                                                fontSize: '15px',
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="姓名"
                                        name="name"
                                        rules={[{ required: true, message: '请输入姓名' }]}
                                    >
                                        <Input
                                            placeholder="请输入姓名"
                                            style={{
                                                borderRadius: '12px',
                                                height: '48px',
                                                fontSize: '15px',
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="邮箱"
                                        name="email"
                                        rules={[
                                            { required: true, message: '请输入邮箱' },
                                            { type: 'email', message: '请输入有效的邮箱地址' }
                                        ]}
                                    >
                                        <Input
                                            placeholder="请输入邮箱"
                                            style={{
                                                borderRadius: '12px',
                                                height: '48px',
                                                fontSize: '15px',
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="电话"
                                        name="phone"
                                    >
                                        <Input
                                            placeholder="请输入电话"
                                            style={{
                                                borderRadius: '12px',
                                                height: '48px',
                                                fontSize: '15px',
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="部门"
                                        name="department"
                                        className="full-width"
                                    >
                                        <Input
                                            placeholder="请输入部门"
                                            style={{
                                                borderRadius: '12px',
                                                height: '48px',
                                                fontSize: '15px',
                                            }}
                                        />
                                    </Form.Item>
                                </div>

                                <div style={{ marginTop: '32px', textAlign: 'right' }}>
                                    <Button
                                        type="primary"
                                        icon={<SaveOutlined />}
                                        loading={loading}
                                        onClick={handleSaveProfile}
                                        style={{
                                            height: '48px',
                                            padding: '0 32px',
                                            fontSize: '15px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
                                            boxShadow: '0 8px 24px rgba(100, 181, 246, 0.4)',
                                            border: 'none',
                                        }}
                                    >
                                        保存修改
                                    </Button>
                                </div>
                            </Form>

                            <Descriptions
                                column={2}
                                style={{
                                    display: editing ? 'none' : 'block',
                                    marginTop: '16px',
                                }}
                                labelStyle={{
                                    fontWeight: 500,
                                    color: '#5c7998',
                                    fontSize: '14px',
                                    background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.1) 0%, rgba(206, 147, 216, 0.1) 100%)',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                }}
                                contentStyle={{
                                    color: '#1e3a5f',
                                    fontSize: '14px',
                                    padding: '12px 16px',
                                }}
                            >
                                <Descriptions.Item label="账号">{personalInfo.username}</Descriptions.Item>
                                <Descriptions.Item label="姓名">{personalInfo.name}</Descriptions.Item>
                                <Descriptions.Item label="邮箱">{personalInfo.email}</Descriptions.Item>
                                <Descriptions.Item label="电话">{personalInfo.phone}</Descriptions.Item>
                                <Descriptions.Item label="部门">{personalInfo.department}</Descriptions.Item>
                                <Descriptions.Item label="角色">
                                    <Tag color="blue">{personalInfo.role}</Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    </TabPane>

                    <TabPane
                        tab={
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <InfoCircleOutlined />
                                关于本系统
                            </span>
                        }
                        key="about"
                    >
                        <div style={{ padding: '32px 24px' }}>
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '40px',
                            }}>
                                <div style={{
                                    fontSize: '80px',
                                    marginBottom: '20px',
                                }}>
                                    🎓
                                </div>
                                <h2 style={{
                                    fontSize: '28px',
                                    fontWeight: 700,
                                    color: '#1e3a5f',
                                    marginBottom: '8px',
                                }}>
                                    教育质量监测系统
                                </h2>
                                <Tag color="green" style={{ fontSize: '14px' }}>
                                    版本 {systemInfo.version}
                                </Tag>
                            </div>

                            <Card
                                style={{
                                    background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.1) 0%, rgba(206, 147, 216, 0.1) 100%)',
                                    borderRadius: '16px',
                                    border: '1px dashed rgba(144, 202, 249, 0.3)',
                                    marginBottom: '24px',
                                }}
                                bodyStyle={{ padding: '24px' }}
                            >
                                <h4 style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#1e3a5f',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                    📖 系统简介
                                </h4>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#5c7998',
                                    lineHeight: '1.8',
                                    margin: 0,
                                }}>
                                    {systemInfo.description}
                                </p>
                            </Card>

                            <Descriptions
                                title={
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#1e3a5f',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}>
                                        ℹ️ 系统信息
                                    </span>
                                }
                                column={1}
                                labelStyle={{
                                    fontWeight: 500,
                                    color: '#5c7998',
                                    fontSize: '14px',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                }}
                                contentStyle={{
                                    color: '#1e3a5f',
                                    fontSize: '14px',
                                    padding: '12px 16px',
                                }}
                            >
                                <Descriptions.Item label="版本号">{systemInfo.version}</Descriptions.Item>
                                <Descriptions.Item label="最后更新">{systemInfo.lastUpdate}</Descriptions.Item>
                                <Descriptions.Item label="开发团队">{systemInfo.developer}</Descriptions.Item>
                                <Descriptions.Item label="技术支持">{systemInfo.contact}</Descriptions.Item>
                            </Descriptions>

                            <Divider style={{ margin: '32px 0' }} />

                            <div style={{
                                textAlign: 'center',
                                color: '#8fa6c0',
                                fontSize: '13px',
                            }}>
                                <p style={{ margin: '0 0 8px 0' }}>
                                    © 2024 教育质量监测系统 · 用心守护教育品质
                                </p>
                                <p style={{ margin: 0 }}>
                                    让我们一起为教育事业贡献力量 💪
                                </p>
                            </div>
                        </div>
                    </TabPane>

                    <TabPane
                        tab={
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <QuestionCircleOutlined />
                                帮助与反馈
                            </span>
                        }
                        key="help"
                    >
                        <div style={{ padding: '32px 24px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.1) 0%, rgba(206, 147, 216, 0.1) 100%)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px',
                                border: '1px dashed rgba(144, 202, 249, 0.3)',
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#1e3a5f',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}>
                                    📚 快速入门指南
                                </h3>
                                <div style={{ lineHeight: '2', fontSize: '14px', color: '#5c7998' }}>
                                    <p><strong>1. 数据采集：</strong>在"数据采集"页面，您可以上传和管理学生、教师、课程及成绩数据。</p>
                                    <p><strong>2. 驾驶舱：</strong>查看系统总览数据，包括学生数量、课程统计等关键指标。</p>
                                    <p><strong>3. 预警分析：</strong>系统会自动分析数据并生成预警信息，帮助您及时发现问题。</p>
                                    <p><strong>4. 智能问答：</strong>如遇问题，可在此处咨询系统相关问题。</p>
                                </div>
                            </div>

                            <Card
                                title={
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#1e3a5f',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}>
                                        ❓ 常见问题
                                    </span>
                                }
                                style={{
                                    borderRadius: '16px',
                                    marginBottom: '24px',
                                }}
                                bodyStyle={{ padding: '16px 24px' }}
                            >
                                <div style={{ lineHeight: '2' }}>
                                    <details style={{ marginBottom: '12px', cursor: 'pointer' }}>
                                        <summary style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '14px' }}>
                                            Q: 如何上传学生数据？
                                        </summary>
                                        <p style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#5c7998', fontSize: '13px' }}>
                                            A: 在"数据采集"页面，点击"学生数据"标签，选择Excel文件进行上传。文件格式需符合系统要求（学号12位、姓名2-4个汉字等）。
                                        </p>
                                    </details>
                                    <details style={{ marginBottom: '12px', cursor: 'pointer' }}>
                                        <summary style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '14px' }}>
                                            Q: 为什么我的登录总是失败？
                                        </summary>
                                        <p style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#5c7998', fontSize: '13px' }}>
                                            A: 请确认账号和密码是否正确。默认账号为 admin / admin123。如忘记密码，请联系系统管理员。
                                        </p>
                                    </details>
                                    <details style={{ marginBottom: '12px', cursor: 'pointer' }}>
                                        <summary style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '14px' }}>
                                            Q: 数据上传失败怎么办？
                                        </summary>
                                        <p style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#5c7998', fontSize: '13px' }}>
                                            A: 请检查数据格式是否符合要求。错误信息会显示具体的问题所在。常见问题包括：学号格式错误、必填字段为空、数据重复等。
                                        </p>
                                    </details>
                                    <details style={{ cursor: 'pointer' }}>
                                        <summary style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '14px' }}>
                                            Q: 如何联系技术支持？
                                        </summary>
                                        <p style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#5c7998', fontSize: '13px' }}>
                                            A: 您可以通过以下方式联系我们：邮箱 support@education.edu.cn，技术支持团队会在24小时内回复您。
                                        </p>
                                    </details>
                                </div>
                            </Card>

                            <Card
                                title={
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#1e3a5f',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}>
                                        💬 意见反馈
                                    </span>
                                }
                                style={{
                                    borderRadius: '16px',
                                }}
                                bodyStyle={{ padding: '24px' }}
                            >
                                <Form layout="vertical">
                                    <Form.Item label="反馈类型" required>
                                        <Input
                                            placeholder="如：功能建议、系统bug、使用咨询等"
                                            style={{
                                                borderRadius: '12px',
                                                height: '48px',
                                                fontSize: '15px',
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="详细描述" required>
                                        <Input.TextArea
                                            rows={4}
                                            placeholder="请详细描述您的问题或建议..."
                                            style={{
                                                borderRadius: '12px',
                                                fontSize: '15px',
                                                resize: 'none',
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="联系方式" >
                                        <Input
                                            placeholder="邮箱或电话（选填）"
                                            style={{
                                                borderRadius: '12px',
                                                height: '48px',
                                                fontSize: '15px',
                                            }}
                                        />
                                    </Form.Item>
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        style={{
                                            height: '52px',
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
                                            boxShadow: '0 8px 24px rgba(100, 181, 246, 0.4)',
                                            border: 'none',
                                            marginTop: '8px',
                                        }}
                                        onClick={() => message.success('✨ 反馈已提交，感谢您的支持！')}
                                    >
                                        🚀 提交反馈
                                    </Button>
                                </Form>
                            </Card>
                        </div>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    )
}

export default Profile