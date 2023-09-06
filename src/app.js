import express from 'express';
import cookieParser from 'cookie-parser';
import connect from './schmas/index.js';
//import postRouter from './routes/post.router.js';
// import commnetRouter from './routes/comments.router.js'
import routes from './routes/index.js';
const app = express();
const PORT = 3000;

connect();

// const router = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', [routes.postRouter,routes.commnetRouter]);


app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
