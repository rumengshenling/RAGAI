const bcrypt = require('bcryptjs');
const { Client } = require('pg');

// 测试数据库连接和密码验证
const testLogin = async () => {
    // 连接到PostgreSQL数据库
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'education_monitor',
        password: '', // 默认为空密码
        port: 5432,
    });

    try {
        await client.connect();
        console.log('连接数据库成功');

        // 查询admin用户
        const result = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
        console.log('查询结果:', result.rows);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('用户信息:', user);

            // 测试密码验证
            const password = 'admin123';
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('密码验证结果:', isPasswordValid);

            if (isPasswordValid) {
                console.log('登录成功！');
            } else {
                console.log('登录失败：密码错误');
            }
        } else {
            console.log('登录失败：用户不存在');
        }
    } catch (error) {
        console.error('数据库操作失败:', error);
    } finally {
        await client.end();
        console.log('数据库连接已关闭');
    }
};

testLogin();