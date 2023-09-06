import Joi from 'joi';

// Joi 스키마를 정의합니다.
const userSchema = Joi.object({
    nickname: Joi.string()
      .min(3)
      .pattern(/^[a-zA-Z0-9]+$/)
      .required(),
    password: Joi.string().min(4).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  });


  