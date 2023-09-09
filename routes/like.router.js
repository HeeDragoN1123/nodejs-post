import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();


/* 게시글 좋아요 등록 과 취소  */

router.put('/posts/:postId/like',authMiddleware, async (req, res, next) =>{
    
    try{
        // const { userId } = res.locals.user;
         console.log(res.locals.user)
        const { userId } = req.user;
        const { postId } = req.params;
    
        const post = await prisma.posts.findUnique({where :{postId : +postId}})
        
        if(!post){
            return res.status(404).json({errorMessage: '게시글이 존재하지 않습니다.'});
        }
    
    
        const addlike = await prisma.likes.findFirst({
            where :{
                UserId : +userId,
                PostId : +postId,
            },
    
        });
    
        if(!addlike){
            await prisma.likes.create({
                data : {
                    UserId : +userId,
                    PostId : +postId,
                }
            })
    
            return res.status(200).json({messege : '게시글의 좋아요를 등록하였습니다.'})
    
        }else{
            await prisma.likes.delete({
                where: { likeId: +addlike.likeId },
            })
            return res.status(200).json({messege : '게시글의 좋아요를 취소하였습니다.'})
        }
    
    }catch(error){
        if (error instanceof Error) {
            return res.status(400).json({ errorMessage: '게시글 좋아요 등록에 실패하였습니다.' });
          } 
    }


});



/* 좋아요 게시글 조회 */
router.get('/posts/:postId/like',authMiddleware, async (req, res, next) => {
    try{
        //const { userId } = res.locals.user;
         const { userId } = req.user;
        const { postId } = req.params;
    
        if(!postId){
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }

        let like = await prisma.posts.findMany({
          where: {
            Likes: {
              some: {
                UserId: +userId,
                PostId: +postId,
              },
            },
          },
          select: {
            postId: true,
            UserId: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            User: {
              select: {
                nickname: true,
              },
            },
            _count: {
              select: {
                Likes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
    
        return res.status(200).json({data: like});
    }catch (error) {
        if (error instanceof Error) {
          return res.status(400).json({ errorMessage: '게시글 좋아요 조회에 실패하였습니다.' });
        } 
      }

 
});




export default router;