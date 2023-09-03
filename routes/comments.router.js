
import express from 'express';
import schemaComment from '../schmas/comments.schema.js'


//express.js 라우터 생성

const router = express.Router();



/* 댓글 생성 API */

router.post('/posts/:_postId/comments', async(req,res,next) =>{
try{
    const {_postId} =req.params
    //console.log(_postId);
    const { password, user, content } = req.body

    if(!content){
        return res.status(400).json({ Message : '댓글 내용을 입력해주세요'})
    }


    const newComment = new schemaComment({
        postId : _postId,
        user,
        password,
        content,
        createdAt : new Date()

    })


    await newComment.save();


    res.status(201).json({message:'댓글을 생성하였습니다.'})
}catch(err){
    console.error(err);
    return res.status(400).json({message : '데이터 형식이 올바르지 않습니다.'})  
}

});


/* 댓글 목록 조회 */

router.get('/posts/:_postId/comments', async(req, res, next) =>{
    try{

        const cheakcomment = await schemaComment.find().sort({createdAt : -1}).exec(); 


        const mapCheakcomment = cheakcomment.map(comment =>({
            return:{
                commentId : comment._id,
                user: comment.user,
                content : comment.content,
                createdAt: comment.createdAt 
            }

        }));
        
        return res.status(200).json( mapCheakcomment );

    }catch(err){
        console.error(err);
        return res.status(400).send({message : '데이터 형식이 올바르지 않습니다.'})  
    }


});



/* 댓글 수정 */

router.put('/posts/:_postId/comments/:_commentId', async(req,res,next)=>{
    try{
        const {_commentId} = req.params;
        const {password , content} = req.body
        
        const editcomment = await schemaComment.findById(_commentId).exec();
    
        if(!content){
            return res.status(400).json({ Message : '댓글 내용을 입력해주세요'})
        }
        if(!_commentId){
            return res.status(404).json({ Message : '댓글 조회에 실패하였습니다.'})
        }
        if(editcomment.password !== password){
            return res.status(400).json({ Message : '비밀번호가 맞지 않습니다.'})
        }
    
    
        editcomment.content = content;
    
        await editcomment.save();
        
        return res.status(200).json({massege: '댓글이 수정되었습니다!!!!.'})
    }catch(err){
        console.error(err);
        return res.status(400).send({message : '데이터 형식이 올바르지 않습니다.'}) 
    }
   

});



/* 댓글 삭제 */

router.delete('/posts/:_postId/comments/:_commentId', async(req,res,next) => {
try{
    const {_commentId} = req.params;
    const {password} = req.body;


    const  deletecomment = await schemaComment.findById(_commentId).exec();

    if(!_commentId){
        return res.status(404).json({message : '댓글 조회에 실패하였습니다.'})
    }
    if(deletecomment.password !== password){
        return res.status(400).json({ Message : '비밀번호가 맞지 않습니다.'})
    }


    await deletecomment.deleteOne({password: _commentId});
    

    return res.status(200).json({message : '댓글을 삭제하였습니다.'});

}catch(err){
    console.error(err);
        return res.status(400).send({message : '데이터 형식이 올바르지 않습니다.'}) 
}

});









export default router;