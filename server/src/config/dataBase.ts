import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'stagemate',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// 데이터베이스 연결 테스트
pool
  .connect()
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch(err => {
    console.error('데이터베이스 연결 실패:', err);
  });

export default pool;