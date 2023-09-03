// schemas/post.schema.js

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true, // 필수요소
  },
  password: {
    type: String,
    required: true, // 필수요소
  },
  title: {
    type: String,
    required: true, // 필수요소
  },
  content: {
    type: String,
    required: true, // 필수요소
  },
  createdAt: {
    type: Date, // createAt 필드는 Date 타입을 가집니다.
    required: true,
  },
});

export default mongoose.model('Schemapost', postSchema);
