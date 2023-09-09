import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';
import Joi from 'joi'
import { isRegexMatch } from '../utils/regex.helper.js';
const router = express.Router();

const re_title = /^[a-zA-Z0-9가-힣\s.!?]{2,30}$/; //영문 대소문자, 숫자, 한글, 공백, 마침표, 느낌표, 물음표를 포함
const re_content =/^[a-zA-Z0-9가-힣\s.!?]{1,5000}$/; //영문 대소문자, 숫자, 한글, 공백, 마침표, 느낌표, 물음표를 포함

const postSchema = Joi.object({
  title : Joi.string().pattern(re_title).required(),
  content : Joi.string().pattern(re_content).required(),
})

/* 게시판 등록  API*/

router.post('/posts', authMiddleware, async (req, res, next) => {
  try {
    const { userId, nickname } = req.user;

    const { title, content } = req.body;
    

    const resultSchema = postSchema.validate(req.body);
    if (resultSchema.error) {
      //console.error('데이터 형식이 올바르지 않습니다.', resultSchema.error); // 콘솔에 에러 메시지 출력
      return res.status(412).json({
        errorMessage: '데이터 형식이 올바르지 않습니다.',
      });
    }

    if (!isRegexMatch(title , re_title)){
    //console.error('게시글 제목의 형식이 일치하지 않습니다.'); // 콘솔에 에러 메시지 출력
  return res.status(412).json({
    errorMessage: '게시글 제목의 형식이 일치하지 않습니다.',
  });
}


if (!isRegexMatch(content, re_content)) {
  //console.error('게시글 내용의 형식이 일치하지 않습니다.'); // 콘솔에 에러 메시지 출력
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
    if (err instanceof Error) {
      return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    } else {
      return res.status(500).json({ errorMessage: '게시글 작성에 실패하였습니다.' });
    }
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
      },
      _count: {
        select: {
          Likes: true,
        },
      },
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
    if (err instanceof Error) {
      return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    } else {
      return res.status(500).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
    }
  }
});

/* 게시글 수정 */
router.put('/posts/:postId',authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const {userId} = req.user;
    const { title, content } = req.body;

    //   const editText = req.body; // req.body에서 "comment" 속성을 읽음
    // console.log(`받은 게시글: ${editText}`);
    // res.send('게시글을 받았습니다.');

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
    if (err instanceof Error) {
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
    if (err instanceof Error) {
      return res.status(400).json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' });
    } else {
      return res.status(500).json({ errorMessage: '게시글 수정에 실패하였습니다.' });
    }
  }
});

export default router;
