import { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Modal, Descriptions, message, Badge, Row, Col, Statistic } from 'antd'
import { earlyWarningApi } from '../../api'

const EarlyWarning: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [warnings, setWarnings] = useState<any[]>([])
    const [indicators, setIndicators] = useState<any[]>([])
    const [selectedWarning, setSelectedWarning] = useState<any>(null)
    const [modalVisible, setModalVisible] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [warningRes, indicatorRes]: any[] = await Promise.all([
                earlyWarningApi.getWarnings(),
                earlyWarningApi.getIndicators(),
            ])
            setWarnings(warningRes?.records || [])
            setIndicators(indicatorRes || [])
        } catch (error) {
            console.error('加载数据失败', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnalyze = async (id: string) => {
        try {
            message.loading('分析中...')
            const res: any = await earlyWarningApi.analyzeCauses(id)
            setWarnings(warnings.map(w => w.id === id ? { ...w, causeAnalysis: res.summary } : w))
            message.success('分析完成')
        } catch (error) {
            message.error('分析失败')
        }
    }

    const columns = [
        { title: '指标名称', dataIndex: 'indicatorName', key: 'indicatorName' },
        { title: '指标类型', dataIndex: 'indicatorType', key: 'indicatorType' },
        {
            title: '当前值',
            dataIndex: 'currentValue',
            key: 'currentValue',
            render: (val: number) => val?.toFixed(2),
        },
        {
            title: '阈值',
            dataIndex: 'threshold',
            key: 'threshold',
            render: (val: number) => val?.toFixed(2),
        },
        {
            title: '预警等级',
            dataIndex: 'warningLevel',
            key: 'warningLevel',
            render: (level: string) => {
                const config: Record<string, { color: string; text: string }> = {
                    critical: { color: 'red', text: '严重' },
                    danger: { color: 'orange', text: '危险' },
                    warning: { color: 'gold', text: '警告' },
                    info: { color: 'blue', text: '提示' },
                }
                const { color, text } = config[level] || { color: 'default', text: level }
                return <Tag color={color}>{text}</Tag>
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const config: Record<string, { status: 'success' | 'processing' | 'warning' | 'error', text: string }> = {
                    pending: { status: 'warning', text: '待处理' },
                    processing: { status: 'processing', text: '处理中' },
                    resolved: { status: 'success', text: '已解决' },
                }
                const { status: badgeStatus, text } = config[status] || { status: 'warning', text: status }
                return <Badge status={badgeStatus} text={text} />
            },
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Button type="link" onClick={() => {
                    setSelectedWarning(record)
                    setModalVisible(true)
                }}>
                    查看详情
                </Button>
            ),
        },
    ]

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>预警分析</h2>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {indicators.slice(0, 4).map((indicator, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card>
                            <Statistic
                                title={indicator.name}
                                value={indicator.currentValue}
                                suffix={indicator.comparison === '>=' ? '(目标: ' + indicator.standard + ')' : ''}
                                valueStyle={{
                                    color: indicator.status === 'normal' ? '#3f8600' : '#cf1322',
                                }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card title="预警记录">
                <Table
                    columns={columns}
                    dataSource={warnings}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="预警详情"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        关闭
                    </Button>,
                    <Button key="analyze" type="primary" onClick={() => handleAnalyze(selectedWarning?.id)}>
                        分析原因
                    </Button>,
                ]}
                width={700}
            >
                {selectedWarning && (
                    <Descriptions column={2} bordered>
                        <Descriptions.Item label="指标名称">{selectedWarning.indicatorName}</Descriptions.Item>
                        <Descriptions.Item label="指标类型">{selectedWarning.indicatorType}</Descriptions.Item>
                        <Descriptions.Item label="当前值">{selectedWarning.currentValue}</Descriptions.Item>
                        <Descriptions.Item label="阈值">{selectedWarning.threshold}</Descriptions.Item>
                        <Descriptions.Item label="预警等级">{selectedWarning.warningLevel}</Descriptions.Item>
                        <Descriptions.Item label="状态">{selectedWarning.status}</Descriptions.Item>
                        <Descriptions.Item label="描述" span={2}>{selectedWarning.description}</Descriptions.Item>
                        <Descriptions.Item label="原因分析" span={2}>
                            {selectedWarning.causeAnalysis || '尚未分析'}
                        </Descriptions.Item>
                        <Descriptions.Item label="建议" span={2}>{selectedWarning.suggestions}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    )
}

export default EarlyWarning