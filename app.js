import express from 'express';
import connect from './schmas/index.js';
import postRouter from './routes/post.router.js';
// import commnetRouter from './routes/comments.router.js'
import routes from './routes/index.js';
const app = express();
const PORT = 3000;

connect();

// const router = express.Router();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api', routes.commnetRouter);
// app.use('/api',routes.postRouter);

// 코멘트 라우터(맨) 앞에 미들웨어를 생성해서 걸러지게 만듬
app.use('/api', [routes.postRouter,routes.commnetRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
