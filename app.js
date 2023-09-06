import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import logMiddleware from './middlewares/log.middleware.js';
import routes from './routes/index.js';
//import connect from './schmas/index.js';
//import signRouter from './routes/sign.router.js';
//import postRouter from './routes/post.router.js';
// import commnetRouter from './routes/comments.router.js'
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';


const app = express();
const PORT = 3000;

//connect();

// const router = express.Router();

//실행 할 미들웨어
// app.use(logMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', [routes.signRouter,routes.postRouter,routes.commnetRouter]);
app.use(errorHandlingMiddleware)

// app.use('/api', routes.commnetRouter);
// app.use('/api',routes.postRouter);



app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});

