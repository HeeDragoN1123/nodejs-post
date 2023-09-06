import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

/* 회원가입 API */

/* - 닉네임, 비밀번호, 비밀번호 확인을 **request**에서 전달받기
- 닉네임은 `최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)`로 구성하기
- 비밀번호는 `최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 실패`로 만들기
- 비밀번호 확인은 비밀번호와 정확하게 일치하기
- 데이터베이스에 존재하는 닉네임을 입력한 채 회원가입 버튼을 누른 경우 "중복된 닉네임입니다." 라는 
에러메세지를 **response**에 포함하기
 */

router.post('/signup', async(req,res,next) =>{

    const {nickname,password,confirm} =req.body
  
    // 닉네임이 동일한 사용자가 있는지 확인
    const isExistUser = await prisma.users.findFirst({where : {nickname}})

    if(!isExistUser){
      res.status(409).json({message: `중복된 닉네임입니다.`})
    }
  
    const user = await prisma.users.create({
        data : {
            nickname,
            password,
            confirm
        }
    })
  

    return res.status(201).json({message : '회원가입이 완료되었습니다.'})
  })
  
  
export default router;