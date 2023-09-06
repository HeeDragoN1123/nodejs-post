// src/routes/users.router.js

import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  const { email, password, name, age, gender, profileImage } = req.body;
  const isExistUser = await prisma.users.findFirst({
    where: {
      email,
    },
  });

  if (isExistUser) {
    return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
  }

  // Users 테이블에 사용자를 추가합니다.
  const user = await prisma.users.create({
    data: { email, password },
  });
  // UserInfos 테이블에 사용자 정보를 추가합니다.
  const userInfo = await prisma.userInfos.create({
    data: {
      UserId: user.userId, // 생성한 유저의 userId를 바탕으로 사용자 정보를 생성합니다.
      name,
      age,
      gender: gender.toUpperCase(), // 성별을 대문자로 변환합니다.
      profileImage,
    },
  });

  return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});

export default router;