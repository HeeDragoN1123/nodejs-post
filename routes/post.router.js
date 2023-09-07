import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';
import Joi from 'joi'

const router = express.Router();

const re_title = /^[a-zA-Z0-9]{2,30}$/;
const re_content = /^[a-zA-Z0-9]{1,5000}$/;

const postSchema = Joi.object({
  title : Joi.string().pattern(re_title).required(),
  content : Joi.string().pattern(re_content).required(),
})

/* 게시판 등록  API*/

router.post('/posts', authMiddleware, async (req, res, next) => {
  try {
    const { userId, nickname } = req.user;

    const { title, content } = req.body;

    
//     # 412 body 데이터가 정상적으로 전달되지 않는 경우
// {"errorMessage": "데이터 형식이 올바르지 않습니다."}
// # 412 Title의 형식이 비정상적인 경우
// {"errorMessage": "게시글 제목의 형식이 일치하지 않습니다."}
// # 412 Content의 형식이 비정상적인 경우
// {"errorMessage": "게시글 내용의 형식이 일치하지 않습니다."}
// # 403 Cookie가 존재하지 않을 경우
// {"errorMessage": "로그인이 필요한 기능입니다."}
// # 403 Cookie가 비정상적이거나 만료된 경우
// {"errorMessage": "전달된 쿠키에서 오류가 발생하였습니다."}
// # 400 예외 케이스에서 처리하지 못한 에러
// {"errorMessage": "게시글 작성에 실패하였습니다."}


if(!isRegexMatch(title, re_title)){
  return res.status(412).json({
    errorMessage: '게시글 제목의 형식이 일치하지 않습니다.',
  });
}


if (!isRegexMatch(content, re_content)) {
  return res.status(412).json({
    errorMessage: '게시글 내용의 형식이 일치하지 않습니다.',
  });
}



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
      User : {
        select : {
          nickname : true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc', // createdAt을 내림차순으로 정렬
    },
  });

  return res.status(200).json({ data: cheakpost });
});

/* 게시글 상세 조회 */
router.get('/posts/:postId',authMiddleware, async (req, res, next) => {
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
    if (err instanceof ValidationError) {
      return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    } else {
      return res.status(500).json({ errorMessage: '게시글 작성에 실패하였습니다.' });
    }
  }
});

/* 게시글 수정 */
router.put('/posts/:postId',authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const {userId} = req.user;
    const { title, content } = req.body;


    if(!isRegexMatch(title, re_title)){
      return res.status(412).json({
        errorMessage: '게시글 제목의 형식이 일치하지 않습니다.',
      });
    }
    
    if (!isRegexMatch(content, re_content)) {
      return res.status(412).json({
        errorMessage: '게시글 내용의 형식이 일치하지 않습니다.',
      });
    }
    

    const editpost = await prisma.posts.findUnique({
      where: { postId: +postId },
    });

    if (!editpost) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }

    if (editpost.UserId !== userId) {
      return res.status(403).json({ errorMessage: '게시글 수정의 권한이 존재하지 않습니다.' });
    }


    await prisma.posts.update({
      data: { title, content },
      where: {
        postId: +postId,
        
      },
    });

    return res.status(200).json({ message: '게시글이 수정되었습니다.' });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    } else {
      return res.status(500).json({ errorMessage: '게시글 수정에 실패하였습니다.' });
    }
  }
});

/* 게시글 삭제 */
router.delete('/posts/:postId',authMiddleware, async (req, res, next) => {
  try {
    const {userId} = req.user;
    const { postId } = req.params;




    /* postId 찾기 */
    const deletepost = await prisma.posts.findUnique({
      where: {
        postId: +postId,

      },
    });

    /* 조건 */
    if (!deletepost) {
      return res.status(404).json({ message: '게시글이 좋재하지 않습니다.' });
    }

    if (deletepost.UserId !== userId) {
      return res.status(403).json({ errorMessage: '게시글 삭제의 권한이 존재하지 않습니다.' });
    }

    /* 조건을 통과하면 게시글 삭제 */
    await prisma.posts.delete({
      where: {
        postId: +postId,
      },
    });

    return res.status(200).json({ message: '게시글을 삭제하였습니다.' });
  } catch (err){
    if (err instanceof ValidationError) {
      return res.status(400).json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' });
    } else {
      return res.status(500).json({ errorMessage: '게시글 수정에 실패하였습니다.' });
    }
  }
});

export default router;
