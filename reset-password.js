const bcrypt = require('bcryptjs');
const { Client } = require('pg');

// 生成bcrypt哈希
const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
        console.error('生成哈希失败:', err);
        return;
    }

    console.log('生成的哈希:', hash);

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

        // 删除现有的admin用户
        await client.query('DELETE FROM users WHERE username = $1', ['admin']);
        console.log('删除现有admin用户成功');

        // 插入新的admin用户 - 使用明确的字段赋值
        const res = await client.query(`
            INSERT INTO users 
            (username, password, email, "realName", role, "isActive")
            VALUES 
            ('admin', '${hash}', 'admin@edu.cn', 'System Administrator', 'admin', true)
        `);

        console.log('插入成功:', res.rowCount, '行受影响');
    } catch (error) {
        console.error('数据库操作失败:', error);
    } finally {
        await client.end();
        console.log('数据库连接已关闭');
    }
});