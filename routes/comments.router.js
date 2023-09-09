import express from 'express';
import schemaComment from '../schmas/comments.schema.js';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import Joi from 'joi'




//express.js 라우터 생성

const router = express.Router();

const re_comment = /^[a-zA-Z0-9가-힣\s.!?]{1,2000}$/

const commentSchema = Joi.object({
  comment : Joi.string().required(),
})

/* 댓글 생성 API */

router.post('/posts/:postId/comments',authMiddleware, async (req, res, next) => {
  try {
    const {userId , nickname} = req.user;
    const { postId } = req.params;
    const { comment } = req.body;

    // const commentText = req.body.comment; // req.body에서 "comment" 속성을 읽음
    // console.log(`받은 댓글: ${commentText}`);
    // res.send('댓글을 받았습니다.');

    const resultSchema = commentSchema.validate(req.body);
    if (resultSchema.error) {
      return res.status(412).json({
        errorMessage: '데이터 형식이 올바르지 않습니다.',
      });
    }

    const post = await prisma.posts.findFirst({where: {postId: +postId} });

    if(!post) {
      return res.status(404).json({message : `게시글이 존재하지 않습니다.`})
    }

    
    const newComment = await prisma.Comments.create({
      data: {
        UserId : +userId, 
        PostId: +postId,
        nickname,
        comment,
        createdAt: new Date(),
        updatedAt: new Date(),
        
      },
    });



    res.status(201).json({ message: '댓글을 생성하였습니다.' });
  } catch (err) {
      if (err instanceof Error) {
      return res.status(400).json({ errorMessage: '댓글 작성에 실패하셨습니다.' });
    }
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
      where : {PostId : +postId},
      select: {
        commentId: true,
        UserId : true, 
        nickname: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc', // createdAt을 내림차순으로 정렬
      },
    });

    return res.status(200).json(cheakcomment);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ errorMessage: '댓글 조회에 실패하셨습니다.' });
    }
  }
});

/* 댓글 수정 */

router.put('/posts/:postId/comments/:commentId',authMiddleware, async (req, res, next) => {
  try {
    const { postId,commentId } = req.params;
    const {userId} =req.user;
    const { comment } = req.body;
    
    const resultSchema = commentSchema.validate(req.body);
    if (resultSchema.error) {
      return res.status(412).json({
        errorMessage: '데이터 형식이 올바르지 않습니다.',
      });
    }

    const editcomment = await prisma.Comments.findUnique({
      where: { commentId: +commentId },
    });


    if (!postId) {
      return res.status(400).json({ Message: '게시글이 존재하지 않습니다.' });
    }
    if (!commentId) {
      return res.status(404).json({ Message: '댓글이 존재하지 않습니다.' });
    }

    if(editcomment.UserId !== userId){
      return res.status(403).json({ errorMessage: '댓글 수정의 권한이 존재하지 않습니다.' });
    }
    

    await prisma.Comments.update({
      data: { comment },
      where: {
        commentId: +commentId,
      },
    });

    return res.status(200).json({ massege: '댓글이 수정되었습니다.' });
  } catch (err) {
    if (err instanceof Error) {
      // console.error('콘솔에러 .'); // 콘솔에 에러 메시지 출력
      return res.status(400).json({ errorMessage: '댓글 수정이 정상적으로 처리되지 않았습니다.' });
    }else{
      return res.status(500).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
    }
  }
});

/* 댓글 삭제 */

router.delete('/posts/:postId/comments/:commentId',authMiddleware, async (req, res, next) => {
  try {
    const { postId , commentId } = req.params;
    const {userId} = req.user;
    const deletecomment = await prisma.Comments.findUnique({
      where: { 
        commentId: +commentId },
    });

    if (!postId) {
      return res.status(400).json({ Message: '게시글이 존재하지 않습니다.' });
    }

    if (!deletecomment) {
      return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
    }

    if(deletecomment.UserId !== userId){
      return res.status(403).json({ errorMessage: '댓글 삭제 권한이 존재하지 않습니다.' });
    }

    await prisma.Comments.delete({
      where: {
        commentId: +commentId,
      },
    });

    return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).json({ errorMessage: '댓글 삭제가 정상적으로 처리되지 않았습니다.' });
    }else{
      return res.status(500).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
    }
  }
});

export default router;


