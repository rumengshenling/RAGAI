import { useState, useRef, useEffect } from 'react'
import { Card, Input, Button, List, Avatar, Spin, message } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons'
import { ragApi } from '../../api'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    sources?: { title: string; relevance: number }[]
    timestamp: Date
}

const KnowledgeQA: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '您好，我是高等教育质量监测AI助手，可以回答关于教学质量、教师评价、学生成绩等方面的问题。请问您有什么问题需要帮助？',
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const res: any = await ragApi.chat({
                question: input,
                conversationHistory: messages.slice(-6).map(m => ({
                    role: m.role,
                    content: m.content,
                })),
            })

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: res.answer || '抱歉，我暂时无法回答这个问题。',
                sources: res.sources,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            message.error('请求失败，请稍后重试')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>智能问答</h2>

            <Card style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                <div
                    ref={listRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 0',
                    }}
                >
                    <List
                        dataSource={messages}
                        renderItem={(item) => (
                            <List.Item style={{ border: 'none', padding: '8px 0' }}>
                                <div style={{
                                    display: 'flex',
                                    width: '100%',
                                    flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                                    gap: 12,
                                }}>
                                    <Avatar
                                        icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                        style={{
                                            backgroundColor: item.role === 'user' ? '#1890ff' : '#87d068',
                                        }}
                                    />
                                    <div style={{
                                        maxWidth: '70%',
                                        padding: '12px 16px',
                                        borderRadius: 12,
                                        backgroundColor: item.role === 'user' ? '#1890ff' : '#f0f0f0',
                                        color: item.role === 'user' ? '#fff' : '#000',
                                    }}>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                                        {item.sources && item.sources.length > 0 && (
                                            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                                                参考来源: {item.sources.map(s => s.title).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                    {loading && (
                        <div style={{ textAlign: 'center', padding: 16 }}>
                            <Spin tip="AI 正在思考..." />
                        </div>
                    )}
                </div>

                <div style={{
                    display: 'flex',
                    gap: 12,
                    padding: '16px 0',
                    borderTop: '1px solid #f0f0f0',
                }}>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={handleSend}
                        placeholder="请输入您的问题..."
                        size="large"
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSend}
                        loading={loading}
                        size="large"
                    >
                        发送
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default KnowledgeQA