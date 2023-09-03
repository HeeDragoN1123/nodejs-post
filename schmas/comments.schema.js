// schemas/comment.schema.js

import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true, // 필수요소
  },
  user: {
    type: String,
    required: true, // 필수요소
  },
  password: {
    type: String,
    required: true, // 필수요소
  },
  content: {
    type: String,
    required: true, // 필수요소
  },
  createdAt: {
    type: Date, // createAt 필드는 Date 타입을 가집니다.
    required: false,
  },
});

export default mongoose.model('Schemacomment', commentSchema);
