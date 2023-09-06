import express from 'express';
import schemaComment from '../schmas/comments.schema.js';
import { prisma } from '../utils/prisma/index.js';
import { PrismaClientRustPanicError } from '@prisma/client/runtime/library.js';

//express.js 라우터 생성

const router = express.Router();

/* 댓글 생성 API */

router.post('/posts/:postId/comments', async (req, res, next) => {
  try {
    const { postId } = req.params;
    //console.log(_postId);
    const { user, password, content } = req.body;

    if (!content) {
      return res.status(400).json({ Message: '댓글 내용을 입력해주세요' });
    }

    // 미들웨어를 사용해보자 (공부) postId를 댓글 API 전체에 추가하는것 보다 미들웨어를 사용해서 전부 적용되게 만듬
    // throw ? 를 사용 (공부) throw 를 사용해서 지금 캐치 부분을 바꾸지 않고 try에서 게시글에 내용이 작성되지 않으면 400번 에러를 내도록 만듬


    
    // 질문 3
    // 지금 try catch 문을 제가 뭔가 잘못쓰고 있나요?
    // if(!user || !password || !content){
    //   return res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    // }


    // const post = await prisma.posts.findFirst({
    //   where: { postId: +postId },
    // });

    // if(!post) return res.status(400).json({message:'존재하지 않는 게시물 입니다.'})

    
    const newComment = await prisma.Comments.create({
      data: {
        user,
        password,
        content,
        createdAt: new Date(),
        postId: +postId,
      },
    });

    res.status(201).json({ message: '댓글을 생성하였습니다.' });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});



/* 댓글 목록 조회 */

router.get('/posts/:postId/comments', async (req, res, next) => {
  try {
    const cheakcomment = await prisma.Comments.findMany({
      select: {
        commentId: true,
        user: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc', // createdAt을 내림차순으로 정렬
      },
    });

    return res.status(200).json(cheakcomment);
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .send({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

/* 댓글 수정 */

router.put('/posts/:postId/comments/:commentId', async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { password, content } = req.body;

    const editcomment = await prisma.Comments.findUnique({
      where: { commentId: +commentId },
    });

    // 질문 2 이부분에서postId 를 사용해서 2차 검증을 하는게 맞는가??
    // 일단은 추가하는게 낫다.
    // const post = await prisma.posts.findUnique({ where: { postId: Number(postId) } });
    // if(!post) return res.status(404).json({ message : "게시글이 존재하지 않습니다." });

    // const comment = await prisma.comments.findUnique({ where: { commentId: Number(commentId) } });
    // if(!comment)return res.status(404).json({ message : "댓글이 존재하지 않습니다." });

    //post 

    if (!content) {
      return res.status(400).json({ Message: '댓글 내용을 입력해주세요' });
    }
    if (!commentId) {
      return res.status(404).json({ Message: '댓글 조회에 실패하였습니다.' });
    }
    if (editcomment.password !== password) {
      return res.status(400).json({ Message: '비밀번호가 맞지 않습니다.' });
    }

    await prisma.Comments.update({
      data: { content },
      where: {
        commentId: +commentId,
        password,
      },
    });

    return res.status(200).json({ massege: '댓글이 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .send({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

/* 댓글 삭제 */

router.delete('/posts/:_postId/comments/:commentId', async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { password } = req.body;

    const deletecomment = await prisma.Comments.findUnique({
      where: {
        commentId: +commentId,
        password,
      },
    });

    if (!commentId) {
      return res.status(404).json({ message: '댓글 조회에 실패하였습니다.' });
    }
    if (deletecomment.password !== password) {
      return res.status(400).json({ Message: '비밀번호가 맞지 않습니다.' });
    }

    await prisma.Comments.delete({
      where: {
        commentId: +commentId,
        password,
      },
    });

    return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .send({ message: '데이터 형식이 올바르지 않습니다.' });
  }
});

export default router;
