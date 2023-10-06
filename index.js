const express = require('express')
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const cors = require('cors')
// const fileUpload = require('express-fileupload');
const path = require('path');
const multer  = require("multer");
const User = require('./models/User');

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const authRouter = require('./authRouter');
// app.use(fileUpload());
app.use(express.json());
app.use("/auth", authRouter);
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) =>{
      cb(null, "uploads");
  },
  filename: (req, file, cb) =>{
      cb(null, file.originalname);
  }
});

app.use(express.static(__dirname));
app.use(multer({storage:storageConfig}).single("filedata"));
app.post("/upload", async function (req, res, next) {
   
    let filedata = req.file;
    console.log(filedata);
    try {
      console.log('------------',req)
      const oldUsername = req.body.oldUsername
      // const  {filename}  = req.file;
      const currentUser = await User.findOne({username: oldUsername})
      if (!currentUser) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      currentUser.avatar = `/${filedata.path}`;
      await currentUser.save();
      return res.json({ message: 'Аватар успешно обновлен' });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Ошибка при обновлении аватара' });
    }
    // if(!filedata)
    //     res.send("Ошибка при загрузке файла");
    // else
    //     res.send("Файл загружен");
});
const start = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://novikovisergeevich:123@cluster0.osefsfh.mongodb.net/?retryWrites=true&w=majority`,
    );
    app.listen(process.env.PORT || 5000, () => console.log(`server statred on port ${PORT}`));
  } catch (error) {
    console.log(e);
  }
};

start();
