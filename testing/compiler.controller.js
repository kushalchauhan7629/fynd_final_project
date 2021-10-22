const Test=require("./compiler.model");
const fs=require("fs");
const { generateFile }=require("./generateFile")
const { executeCpp}=require("./executeCpp")
const { executePy } = require("./executePy")
const { executeJava }=require("./executeJava")




//show all output

const allOutput=async (req,res, next)=>{
 
    Test.find({}, { _id:0,questionId:"$_id",output:"$output"})
    .then(response=>{
         res.json({
             response
         })
     })
     .catch(error=>{
         res.status(400).json({
             error
         })
     })
    }
 



//Show Single Output
const singleOutput=(req, res, next)=>{
    let questionId=req.body.questionId
    Test.findById(questionId, { _id:0,output:"$output"})
    .then(response=>{
        res.json({
            response
        })
    })
    .catch(error=>{
        res.status(404).json({
            message:`Test with id: ${req.body.questionId} not found`
        })
    })
}

//code run
const functionsByLang={
    cpp:executeCpp,
    py:executePy,
    java:executeJava
}



const run=async (req,res)=>{
   
    const {language="cpp",code}=req.body;
    if(code===undefined){
        return res.status(400).json({success:false, error:"Empty code body"})
    }
    try{
  
    //need to generate a c++ file with content from the request
    const filepath=await generateFile(language, code)
    const test=await new Test({language, filepath}).save()
    const questionId=test["_id"]
   
 
    //we need to run the file and send the response
    let output;
    output=await functionsByLang[test.language](test.filepath);
    test["output"]=output;
    
    await test.save()

    return res.json({questionId,output})
   
   
     }catch(err){
        res.status(500).json({err})
    }
   
}





module.exports={
    allOutput, singleOutput,run
};