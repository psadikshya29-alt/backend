const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cd)=>{
    const allowedFileType = ['image/jpg', 'image/png', 'image/jpeg ']
    if(!allowedFileType.includes(file.mimetype)){
       cb(new Error('Invalid file type.Only jpg,png,and jpeg are allowed'));
       return;
    }
    cd(null,'./storage'); //cd(error,sucess)
  },
  filename:(req,file,cd)=>{
    cd(null, Date.now() + "hello-"+ file.originalname)
  }
})

module.exports= {
  multer,
  storage
}