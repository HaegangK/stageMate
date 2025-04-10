import express from 'express';
import cors from 'cors';
import path from 'path';
import postRoute from './routes/post_route';
import http from 'http';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/posts', postRoute);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
}); 