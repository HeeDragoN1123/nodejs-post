import express from 'express';
import schemaComment from '../schmas/comments.schema.js';
import { prisma } from '../utils/prisma/index.js';
import { PrismaClientRustPanicError } from '@prisma/client/runtime/library.js';
import authMiddleware from '../middlewares/auth.middleware.js';

//express.js 라우터 생성

const router = express.Router();

/* 댓글 생성 API */

router.post('/posts/:postId/comments',authMiddleware, async (req, res, next) => {
  try {
    const {userId , nickname} = req.user;
    const { postId } = req.params;
    const { content } = req.body;


    const post = await prisma.posts.findFirst({where: {postId: +postId} });

    if(!post) {
      return res.status(404).json({message : `게시글이 존재하지 않습니다.`})
    }

    
    const newComment = await prisma.Comments.create({
      data: {
        UserId : +userId, 
        postId: +postId,
        nickname,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        
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
    const {postId} = req.params;

    const post = await prisma.posts.findFirst({
      where :{postId : +postId}
    });

    if(!post){
      return res.status(404).json({message : `게시글이 존재하지 않습니다.`})
    }

    const cheakcomment = await prisma.Comments.findMany({
      where : {postId : +postId},
      select: {
        commentId: true,
        UserId : true, 
        nickname: true,
        content: true,
        createdAt: true,
        updatedAt: true,
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
    const { postId,commentId } = req.params;
    const { content } = req.body;

    const editcomment = await prisma.Comments.findUnique({
      where: { commentId: +commentId },
    });


    if (!content) {
      return res.status(400).json({ Message: '댓글 내용을 입력해주세요' });
    }
    if (!commentId) {
      return res.status(404).json({ Message: '댓글 조회에 실패하였습니다.' });
    }
    
    await prisma.Comments.update({
      data: { content },
      where: {
        commentId: +commentId,
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
    const { postId , commentId } = req.params;

    const deletecomment = await prisma.Comments.findUnique({
      where: {
        commentId: +commentId,
      },
    });

    if (!commentId) {
      return res.status(404).json({ message: '댓글 조회에 실패하였습니다.' });
    }


    await prisma.Comments.delete({
      where: {
        commentId: +commentId,
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


