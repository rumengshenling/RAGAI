import axios from 'axios'
import { message } from 'antd'

const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        console.log('Request token:', token)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log('Authorization header set:', config.headers.Authorization)
        } else {
            console.error('No token found in localStorage')
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        // 处理后端统一响应格式
        if (response.data?.data) {
            return response.data.data
        }
        return response.data
    },
    (error) => {
        console.error('API Error:', error)
        console.error('Error response:', error.response)
        console.error('Error status:', error.response?.status)
        if (error.response?.status === 401) {
            console.error('401 Unauthorized, removing token and redirecting to login')
            localStorage.removeItem('token')
            window.location.href = '/login'
            message.error('登录已过期，请重新登录')
        } else if (error.response?.data?.message) {
            message.error(error.response.data.message)
        } else {
            message.error('请求失败，请稍后重试')
        }
        return Promise.reject(error)
    }
)

// 认证接口
export const authApi = {
    login: (data: { username: string; password: string }) => {
        console.log('Sending login request to /auth/login with data:', data);
        return api.post('/auth/login', data);
    },
    register: (data: { username: string; password: string; email: string }) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
}

// 数据采集接口
export const dataCollectionApi = {
    uploadTeachers: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/data-collection/upload/teachers', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
    uploadCourses: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/data-collection/upload/courses', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
    uploadStudents: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/data-collection/upload/students', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
    uploadScores: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/data-collection/upload/scores', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
    getImportRecords: (params?: { page?: number; limit?: number; dataType?: string }) =>
        api.get('/data-collection/import-records', { params }),
    getTemplate: (type: string) => api.get(`/data-collection/template/${type}`),
}

// 数据可视化接口
export const visualizationApi = {
    getOverview: () => api.get('/visualization/overview'),
    getTeachingStats: (params?: { collegeId?: string; year?: string }) =>
        api.get('/visualization/teaching', { params }),
    getTeacherAnalysis: (params?: { collegeId?: string }) =>
        api.get('/visualization/teachers', { params }),
    getStudentAnalysis: (params?: { collegeId?: string }) =>
        api.get('/visualization/students', { params }),
    getTrendData: (params: { indicator: string; startYear?: string; endYear?: string }) =>
        api.get('/visualization/trends', { params }),
}

// 预警分析接口
export const earlyWarningApi = {
    getDashboard: () => api.get('/early-warning/dashboard'),
    getWarnings: (params?: { page?: number; limit?: number; level?: string; type?: string }) =>
        api.get('/early-warning/records', { params }),
    getWarningDetail: (id: string) => api.get(`/early-warning/records/${id}`),
    analyzeCauses: (id: string) => api.post(`/early-warning/analyze/${id}`),
    getIndicators: () => api.get('/early-warning/indicators'),
    getWarningStudents: () => api.get('/early-warning/students'),
    getStudentDetail: (studentId: string) => api.get(`/early-warning/student/${studentId}`),
}

// RAG智能问答接口
export const ragApi = {
    chat: (data: { question: string; conversationHistory?: any[] }) => api.post('/rag/chat', data),
    uploadDocument: (data: { title: string; content: string; category?: string; tags?: string[] }) =>
        api.post('/rag/documents', data),
    getDocuments: (params?: { page?: number; limit?: number }) =>
        api.get('/rag/documents', { params }),
}

export default api