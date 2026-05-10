import { useState, useEffect } from 'react'
import { Upload, Button, Card, Table, Tabs, message, Tag, Space } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { dataCollectionApi } from '../../api'

const DataCollection: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const [records, setRecords] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState('teachers')
    
    useEffect(() => {
        loadRecords()
    }, [])

    const handleUpload = async (file: File, type: string) => {
        setLoading(true)
        try {
            let res: any
            switch (type) {
                case 'teachers':
                    res = await dataCollectionApi.uploadTeachers(file)
                    break
                case 'courses':
                    res = await dataCollectionApi.uploadCourses(file)
                    break
                case 'students':
                    res = await dataCollectionApi.uploadStudents(file)
                    break
                case 'scores':
                    res = await dataCollectionApi.uploadScores(file)
                    break
            }
            console.log('Upload response:', res)
            message.success(`上传成功: ${res.success} 条 失败: ${res.failed} 条`)
            if (res.errors && res.errors.length > 0) {
                // 显示失败的具体原因
                res.errors.forEach((error: any, index: number) => {
                    if (index < 3) { // 只显示前3个错误
                        message.warning(`第${error.row}行: ${error.errors?.join(', ') || error.error}`)
                    }
                })
            }
            loadRecords()
        } catch (error: any) {
            console.error('Upload error:', error)
            // 显示具体的错误信息
            if (error.response?.data?.message) {
                message.error(`上传失败: ${error.response.data.message}`)
            } else {
                message.error('上传失败，请稍后重试')
            }
        } finally {
            setLoading(false)
        }
        return false
    }

    const handleDownloadTemplate = async (type: string) => {
        try {
            const res: any = await dataCollectionApi.getTemplate(type)
            console.log('Template response:', res)
            // 确保正确获取buffer数据，处理后端统一响应格式
            const buffer = res.buffer || (res.data?.buffer)
            const mimeType = res.mimeType || (res.data?.mimeType)
            const fileName = res.fileName || (res.data?.fileName)
            
            if (!buffer) {
                throw new Error('No buffer found in response')
            }
            
            const blob = new Blob(
                [Uint8Array.from(atob(buffer), c => c.charCodeAt(0))],
                { type: mimeType }
            )
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            a.click()
            URL.revokeObjectURL(url)
            message.success('模板下载成功')
        } catch (error) {
            console.error('Download template error:', error)
            message.error('下载失败')
        }
    }

    const loadRecords = async () => {
        try {
            const res: any = await dataCollectionApi.getImportRecords()
            setRecords(res.records || [])
        } catch (error) {
            console.error('获取记录失败', error)
        }
    }

    const uploadProps = (type: string) => ({
        accept: '.xlsx,.xls',
        showUploadList: false,
        beforeUpload: (file: UploadFile) => handleUpload(file as unknown as File, type),
    })

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
        { title: '数据类型', dataIndex: 'dataType', key: 'dataType' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    pending: 'default',
                    processing: 'processing',
                    success: 'success',
                    failed: 'error',
                }
                return <Tag color={colors[status]}>{status}</Tag>
            },
        },
        { title: '成功数', dataIndex: 'successCount', key: 'successCount' },
        { title: '失败数', dataIndex: 'failedCount', key: 'failedCount' },
        { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    ]

    const tabItems = [
        {
            key: 'teachers',
            label: '教师数据',
            children: (
                <Card>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                            <Upload {...uploadProps('teachers')}>
                                <Button icon={<UploadOutlined />} loading={loading}>
                                    上传教师数据
                                </Button>
                            </Upload>
                            <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('teachers')}>
                                下载模板
                            </Button>
                        </Space>
                        <p>支持格式: .xlsx, .xls</p>
                        <p>必填字段: 教师姓名、学院ID、职称、学历、所属部门、入职时间</p>
                    </Space>
                </Card>
            ),
        },
        {
            key: 'courses',
            label: '课程数据',
            children: (
                <Card>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                            <Upload {...uploadProps('courses')}>
                                <Button icon={<UploadOutlined />} loading={loading}>
                                    上传课程数据
                                </Button>
                            </Upload>
                            <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('courses')}>
                                下载模板
                            </Button>
                        </Space>
                        <p>支持格式: .xlsx, .xls</p>
                        <p>必填字段: 课程名称、课程代码、学院ID、教师ID、学分、学时、课程类型</p>
                    </Space>
                </Card>
            ),
        },
        {
            key: 'students',
            label: '学生数据',
            children: (
                <Card>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                            <Upload {...uploadProps('students')}>
                                <Button icon={<UploadOutlined />} loading={loading}>
                                    上传学生数据
                                </Button>
                            </Upload>
                            <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('students')}>
                                下载模板
                            </Button>
                        </Space>
                        <p>支持格式: .xlsx, .xls</p>
                        <p>必填字段: 学号、姓名、性别、出生日期、入学日期、专业、年级</p>
                    </Space>
                </Card>
            ),
        },
        {
            key: 'scores',
            label: '成绩数据',
            children: (
                <Card>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                            <Upload {...uploadProps('scores')}>
                                <Button icon={<UploadOutlined />} loading={loading}>
                                    上传成绩数据
                                </Button>
                            </Upload>
                            <Button icon={<DownloadOutlined />} onClick={() => handleDownloadTemplate('scores')}>
                                下载模板
                            </Button>
                        </Space>
                        <p>支持格式: .xlsx, .xls</p>
                        <p>必填字段: 学生ID、课程ID、最终成绩、学期、学年</p>
                    </Space>
                </Card>
            ),
        },
    ]

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>数据采集</h2>

            <Card title="数据上传" style={{ marginBottom: 24 }}>
                <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
            </Card>

            <Card title="导入记录">
                <Table
                    columns={columns}
                    dataSource={records}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    )
}

export default DataCollection