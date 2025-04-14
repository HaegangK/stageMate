import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

import authRouter from './routes/auth_route';
import postRouter from './routes/post_route';
import mypageRouter from './routes/mypage_route';

const app = express();

const port: number = Number(process.env.PORT) || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 등록
app.use('/api/posts', postRouter);
app.use('/api/auth', authRouter);
app.use('/api/mypage', mypageRouter);

// 404 처리
app.use(notFoundHandler);

// 에러 처리
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});