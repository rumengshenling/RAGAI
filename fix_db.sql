-- 删除整个 public schema 及其所有表
DROP SCHEMA public CASCADE;

-- 重新创建 public schema
CREATE SCHEMA public;

-- 重新授权
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
