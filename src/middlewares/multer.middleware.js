import multer from "multer";

// Here we use disc storage or memory storage to save our file
const storage = multer.diskStorage({
    // ye ho file h ye multer k paas hi hota h 
    // req k andar to hammaare paas jo hmare user se JSON Data wagrah aarah h wahi hota h  but agar hamare paas file bhi aari h to  uske lie hmare paas multer hota h
    // Here cb is callback
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    // It consist of filename ki ham file name kis hisaab  se rakhna chahte h (yaha pr hm unique or random nam bhi rakh skte h pr hm yaha pr  oruiginal name hi rakh re jo ki user ne dia tha hame)
    filename: function (req, file, cb) {
      
      cb(null,file.originalname)
    }
  })
  
  // This Upload is a niddleware function 
  export const upload = multer({ storage: storage })