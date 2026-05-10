const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing login...');
    // 测试登录
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Login response:', loginResponse.data);
    // 正确处理后端的统一响应格式
    const token = loginResponse.data.data?.accessToken;
    console.log('Token:', token);
    console.log('Token length:', token?.length);
    
    // 测试访问受保护的API
    console.log('Testing protected API...');
    const dashboardResponse = await axios.get('http://localhost:3000/api/early-warning/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Dashboard response:', dashboardResponse.data);
    console.log('Test successful!');
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAuth();