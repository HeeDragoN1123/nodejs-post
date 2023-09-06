import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';


const router = express.Router();

/* 게시판 등록  API*/

router.post('/posts', authMiddleware, async (req, res, next) => {
  try {
    const { userId, nickname } = req.user;

    const { title, content } = req.body;
    
    if(!content){
      return res.status(400).json({message : "댓글 내용을 입력해주세요"})
  }
  

  // 질문 1  400 번 오류 위치  그리고 그럼 catch 에 무엇을 써야하는가?
  // if(!postId||!user||!password){
  //   return res.status(400).json({message : "데이터 형식이 올바르지 않습니다."})
  // }


    const newPost = await prisma.posts.create({
      data: {
        UserId : userId, 
        nickname,
        title,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });


    // res.status(201).json({newPost})
    res.status(201).json({ message: '개시글을 생성하였습니다' });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});



/* 게시판 목록 조회 */
router.get('/posts', async (req, res, next) => {
  const cheakpost = await prisma.posts.findMany({
    select: {
      UserId : true,
      postId: true,
      nickname: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc', // createdAt을 내림차순으로 정렬
    },
  });

  return res.status(200).json({ data: cheakpost });
});

/* 게시글 상세 조회 */
router.get('/posts/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;

    //const cheak1post = await Schemapost.findById(_postId).exec();
    const cheak1post = await prisma.posts.findFirst({
      where: { postId: +postId },
      select: {
        UserId : true,
        postId: true,
        nickname: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({ data: cheak1post });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

/* 게시글 수정 */
router.put('/posts/:postId', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const {userId} = req.user;
    const { title, content } = req.body;

    const editpost = await prisma.posts.findUnique({
      where: { postId: +postId },
    });

    if (!editpost) {
      return res.status(404).json({ message: '게시글 수정에 실패하였습니다.' });
    }

    // if (editpost.UserId !== userId) {
    //   return res.status(401).json({ message: '게시글을 수정할 권한이 없습니다.' });
    // }

    // if (editpost.password !== password) {
    //   return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    // }

    await prisma.posts.update({
      data: { title, content },
      where: {
        postId: +postId,
       // password,
      },
    });

    return res.status(200).json({ message: '게시글이 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

/* 게시글 삭제 */
router.delete('/posts/:postId', async (req, res, next) => {
  try {
    const {userId} = req.user;
    const { postId } = req.params;
  //  const { password } = req.body;

    /* postId 찾기 */
    const deletepost = await prisma.posts.findUnique({
      where: {
        postId: +postId,
      //  password,
      },
    });

    /* 조건 */
    if (!deletepost) {
      return res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
    }


    // if (deletepost.UserId !== userId) {
    //   return res.status(401).json({ message: '게시글을 삭제할 권한이 없습니다.' });
    // }

    // if (deletepost.password !== password) {
    //   return res.status(400).json({ message: '비밀번호가 맞지 않습니다.' });
    // }

    /* 조건을 통과하면 게시글 삭제 */
    await prisma.posts.delete({
      where: {
        postId: +postId,
     //   password,
      },
    });

    return res.status(200).json({ message: '게시글을 삭제하였습니다.' });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

export default router;
