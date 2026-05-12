import { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Input, Space, message, Row, Col, Statistic } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { earlyWarningApi } from '../../api'

const EarlyWarning: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [warningStudents, setWarningStudents] = useState<any[]>([])
    const [searchText, setSearchText] = useState('')
    const [searchResult, setSearchResult] = useState<any>(null)
    const [showSearchResult, setShowSearchResult] = useState(false)

    useEffect(() => {
        loadWarningStudents()
    }, [])

    const loadWarningStudents = async () => {
        setLoading(true)
        try {
            const res = await earlyWarningApi.getWarningStudents()
            setWarningStudents(res || [])
        } catch (error) {
            console.error('加载预警学生数据失败', error)
            message.error('加载预警学生数据失败')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!searchText.trim()) {
            setShowSearchResult(false)
            return
        }
        setLoading(true)
        try {
            const res = await earlyWarningApi.getStudentDetail(searchText)
            setSearchResult(res)
            setShowSearchResult(true)
        } catch (error) {
            console.error('查询学生信息失败', error)
            message.error('查询学生信息失败')
        } finally {
            setLoading(false)
        }
    }

    const getWarningLevelColor = (level: string) => {
        const config: Record<string, string> = {
            critical: 'red',
            danger: 'orange',
            warning: 'blue',
        }
        return config[level] || 'default'
    }

    const getWarningLevelText = (level: string) => {
        const config: Record<string, string> = {
            critical: '红色预警',
            danger: '黄色预警',
            warning: '蓝色预警',
        }
        return config[level] || '正常'
    }

    const columns = [
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '学号', dataIndex: 'studentId', key: 'studentId' },
        { title: '性别', dataIndex: 'gender', key: 'gender', render: (g: string) => g === 'male' ? '男' : '女' },
        { title: '专业', dataIndex: 'major', key: 'major' },
        { title: '年级', dataIndex: 'grade', key: 'grade' },
        { title: '未获得学分', dataIndex: 'failedCredits', key: 'failedCredits', render: (v: number) => <span style={{ fontWeight: 'bold', color: v >= 10 ? '#ff4d4f' : '#1890ff' }}>{v}</span> },
        {
            title: '预警等级',
            dataIndex: 'warningLevel',
            key: 'warningLevel',
            render: (level: string) => <Tag color={getWarningLevelColor(level)}>{getWarningLevelText(level)}</Tag>,
        },
        {
            title: '未通过课程',
            dataIndex: 'failedCourses',
            key: 'failedCourses',
            render: (courses: any[]) => (
                <Space direction="vertical" size="small">
                    {courses?.map((course, idx) => (
                        <Tag key={idx} size="small">{course.courseName} ({course.score}分)</Tag>
                    )) || '-'}
                </Space>
            ),
        },
    ]

    const searchResultColumns = [
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '学号', dataIndex: 'studentId', key: 'studentId' },
        { title: '性别', dataIndex: 'gender', key: 'gender', render: (g: string) => g === 'male' ? '男' : '女' },
        { title: '专业', dataIndex: 'major', key: 'major' },
        { title: '年级', dataIndex: 'grade', key: 'grade' },
        { title: '未获得学分', dataIndex: 'failedCredits', key: 'failedCredits', render: (v: number) => <span style={{ fontWeight: 'bold', color: v >= 10 ? '#ff4d4f' : '#1890ff' }}>{v}</span> },
        {
            title: '预警等级',
            dataIndex: 'warningLevel',
            key: 'warningLevel',
            render: (level: string) => level ? <Tag color={getWarningLevelColor(level)}>{getWarningLevelText(level)}</Tag> : <Tag color="green">正常</Tag>,
        },
        {
            title: '未通过课程',
            dataIndex: 'failedCourses',
            key: 'failedCourses',
            render: (courses: any[]) => (
                <Space direction="vertical" size="small">
                    {courses?.map((course, idx) => (
                        <Tag key={idx} size="small">{course.courseName} ({course.score}分)</Tag>
                    )) || '-'}
                </Space>
            ),
        },
    ]

    const getBlueWarningCount = () => warningStudents.filter(s => s.warningLevel === 'warning').length
    const getYellowWarningCount = () => warningStudents.filter(s => s.warningLevel === 'danger').length
    const getRedWarningCount = () => warningStudents.filter(s => s.warningLevel === 'critical').length

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>学生学分预警分析</h2>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="蓝色预警 (≥10分)"
                            value={getBlueWarningCount()}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="黄色预警 (≥20分)"
                            value={getYellowWarningCount()}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="红色预警 (≥30分)"
                            value={getRedWarningCount()}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="预警学生总数"
                            value={warningStudents.length}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 搜索框 */}
            <Card style={{ marginBottom: 24 }}>
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        placeholder="请输入学号查询学生学分情况"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        prefix={<SearchOutlined />}
                    />
                    <Button type="primary" onClick={handleSearch} loading={loading}>
                        查询
                    </Button>
                    <Button onClick={() => {
                        setSearchText('')
                        setShowSearchResult(false)
                        loadWarningStudents()
                    }}>
                        重置
                    </Button>
                </Space.Compact>
            </Card>

            {/* 搜索结果 */}
            {showSearchResult && (
                <Card title="学生查询结果" style={{ marginBottom: 24 }}>
                    {searchResult ? (
                        <Table
                            columns={searchResultColumns}
                            dataSource={[searchResult]}
                            rowKey="studentId"
                            pagination={false}
                        />
                    ) : (
                        <p style={{ textAlign: 'center', color: '#999' }}>未找到该学生</p>
                    )}
                </Card>
            )}

            {/* 预警学生列表 */}
            <Card title={`预警学生列表 (${warningStudents.length}人)`}>
                <Table
                    columns={columns}
                    dataSource={warningStudents}
                    rowKey="studentId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    )
}

export default EarlyWarning