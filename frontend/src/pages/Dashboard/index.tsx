import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Spin, message } from 'antd'
import {
    UserOutlined,
    BookOutlined,
    TeamOutlined,
    AlertOutlined,
    TrophyOutlined,
    CheckCircleOutlined,
    BarChartOutlined,
} from '@ant-design/icons'
import { Line } from '@ant-design/charts'
import { visualizationApi, earlyWarningApi } from '../../api'

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true)
    const [overview, setOverview] = useState<any>({})
    const [warnings, setWarnings] = useState<any[]>([])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            loadData()
        } else {
            setLoading(false)
        }
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            if (!token) {
                setLoading(false)
                return
            }
            const [overviewRes, warningRes]: any[] = await Promise.all([
                visualizationApi.getOverview(),
                earlyWarningApi.getDashboard(),
            ])
            setOverview(overviewRes)
            setWarnings(warningRes?.recentWarnings || [])
        } catch (error) {
            console.error('加载数据失败', error)
        } finally {
            setLoading(false)
        }
    }

    const trendConfig = {
        data: [
            { month: '1月', value: 85 },
            { month: '2月', value: 88 },
            { month: '3月', value: 82 },
            { month: '4月', value: 90 },
            { month: '5月', value: 87 },
            { month: '6月', value: 92 },
        ],
        xField: 'month',
        yField: 'value',
        smooth: true,
        point: { size: 4 },
        color: '#64b5f6',
        areaStyle: {
            fill: 'l(270) 0:rgba(100, 181, 246, 0.3) 1:rgba(100, 181, 246, 0.05)',
        },
    }

    const warningColumns = [
        { title: '指标名称', dataIndex: 'indicatorName', key: 'indicatorName' },
        { title: '当前值', dataIndex: 'currentValue', key: 'currentValue' },
        { title: '阈值', dataIndex: 'threshold', key: 'threshold' },
        {
            title: '预警等级',
            dataIndex: 'warningLevel',
            key: 'warningLevel',
            render: (level: string) => {
                const colors: Record<string, string> = {
                    critical: 'red',
                    danger: 'orange',
                    warning: 'gold',
                    info: 'blue',
                }
                const labels: Record<string, string> = {
                    critical: '严重',
                    danger: '危险',
                    warning: '警告',
                    info: '信息',
                }
                return <Tag color={colors[level]}>{labels[level]?.toUpperCase()}</Tag>
            },
        },
        { title: '描述', dataIndex: 'description', key: 'description' },
    ]

    const statCards = [
        {
            title: '教师数量',
            value: overview?.summary?.teacherCount || 0,
            icon: <UserOutlined />,
            color: '#64b5f6',
            bgColor: 'linear-gradient(135deg, rgba(100, 181, 246, 0.1) 0%, rgba(100, 181, 246, 0.05) 100%)',
        },
        {
            title: '学生数量',
            value: overview?.summary?.studentCount || 0,
            icon: <TeamOutlined />,
            color: '#ba68c8',
            bgColor: 'linear-gradient(135deg, rgba(186, 104, 200, 0.1) 0%, rgba(186, 104, 200, 0.05) 100%)',
        },
        {
            title: '课程数量',
            value: overview?.summary?.courseCount || 0,
            icon: <BookOutlined />,
            color: '#81c784',
            bgColor: 'linear-gradient(135deg, rgba(129, 199, 132, 0.1) 0%, rgba(129, 199, 132, 0.05) 100%)',
        },
        {
            title: '预警数量',
            value: overview?.summary?.warningCount || 0,
            icon: <AlertOutlined />,
            color: '#ffb74d',
            bgColor: 'linear-gradient(135deg, rgba(255, 183, 77, 0.1) 0%, rgba(255, 183, 77, 0.05) 100%)',
        },
    ]

    const quickStats = [
        {
            title: '平均教学评分',
            value: overview?.quickStats?.avgTeachingScore || 0,
            suffix: '分',
            precision: 1,
            icon: <TrophyOutlined />,
            color: '#64b5f6',
        },
        {
            title: '平均课程通过率',
            value: overview?.quickStats?.avgPassRate || 0,
            suffix: '%',
            precision: 1,
            icon: <CheckCircleOutlined />,
            color: '#81c784',
        },
        {
            title: '学生平均GPA',
            value: overview?.quickStats?.avgGPA || 0,
            precision: 2,
            icon: <BarChartOutlined />,
            color: '#ba68c8',
        },
    ]

    if (loading) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '100px 20px',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                minHeight: '100vh',
            }}>
                <Spin size="large" tip="加载中..." />
            </div>
        )
    }

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #e8f5e9 100%)',
            padding: '24px 0',
            margin: '-24px -24px -24px -24px',
        }}>
            <div style={{ padding: '0 24px' }}>
                <div style={{ 
                    marginBottom: '32px', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <div style={{
                        fontSize: '48px',
                        animation: 'bounce 2s ease-in-out infinite',
                    }}>
                        📊
                    </div>
                    <div>
                        <h2 style={{ 
                            margin: 0, 
                            fontSize: '28px',
                            fontWeight: 700,
                            color: '#1e3a5f',
                        }}>
                            数据概览
                        </h2>
                        <p style={{ 
                            margin: '8px 0 0 0', 
                            color: '#5c7998',
                            fontSize: '14px',
                        }}>
                            了解您的教育质量监控数据
                        </p>
                    </div>
                </div>

                <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
                    {statCards.map((stat, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                            <Card 
                                bordered={false}
                                style={{
                                    borderRadius: '20px',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '16px',
                                    padding: '8px',
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        background: stat.bgColor,
                                        color: stat.color,
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Statistic
                                            title={
                                                <span style={{ 
                                                    color: '#5c7998', 
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                }}>
                                                    {stat.title}
                                                </span>
                                            }
                                            value={stat.value}
                                            valueStyle={{ 
                                                color: stat.color, 
                                                fontSize: '28px',
                                                fontWeight: 700,
                                                lineHeight: 1.2,
                                            }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
                    {quickStats.map((stat, index) => (
                        <Col xs={24} sm={12} md={8} key={index}>
                            <Card 
                                bordered={false}
                                style={{
                                    borderRadius: '20px',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                                    <div style={{
                                        fontSize: '36px',
                                        marginBottom: '12px',
                                        color: stat.color,
                                    }}>
                                        {stat.icon}
                                    </div>
                                    <Statistic
                                        title={
                                            <span style={{ 
                                                color: '#5c7998', 
                                                fontSize: '14px',
                                                fontWeight: 500,
                                            }}>
                                                {stat.title}
                                            </span>
                                        }
                                        value={stat.value}
                                        suffix={stat.suffix}
                                        precision={stat.precision}
                                        valueStyle={{ 
                                            color: stat.color, 
                                            fontSize: '32px',
                                            fontWeight: 700,
                                        }}
                                    />
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row gutter={[20, 20]}>
                    <Col xs={24} lg={12}>
                        <Card 
                            title={
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#1e3a5f',
                                }}>
                                    <span>📈</span>
                                    教学质量趋势
                                </div>
                            }
                            bordered={false}
                            style={{
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                            }}
                            styles={{ body: { padding: '24px' } }}
                        >
                            <Line {...trendConfig} height={300} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card 
                            title={
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#1e3a5f',
                                }}>
                                    <span>⚠️</span>
                                    最新预警记录
                                </div>
                            }
                            bordered={false}
                            style={{
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                            }}
                            styles={{ body: { padding: '24px' } }}
                        >
                            {warnings.length === 0 ? (
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '40px 20px',
                                    color: '#8fa6c0',
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                                    <p>暂无预警记录，继续保持！</p>
                                </div>
                            ) : (
                                <Table
                                    columns={warningColumns}
                                    dataSource={warnings}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    style={{ marginTop: '8px' }}
                                />
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
            
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    )
}

export default Dashboard