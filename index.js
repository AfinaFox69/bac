const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const User = require('./models/User');

const authRouter = require('./authRouter');
const { request } = require('http');
const { addUser, findUser, getRoomUsers, removeUser } = require('./userschat');

const chatMessageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  socketId: String,
  room: String,
  date: String,
  time:String,
});
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }) => {
    socket.join(room);
    const { user, isExist } = addUser({ name, room });

    const userMessage = isExist ? `'${user.name}', here you go again` : `Joined '${name}'`;

    socket.emit('message', {
      data: { user: { name: 'Admin' }, message: userMessage },
    });

    socket.broadcast.to(user.room).emit('message', {
      data: { user: { name: 'Admin' }, message: ` '${name}' has joined` },
    });

    io.to(user.room).emit('joinRoom', {
      data: { users: getRoomUsers(user.room) },
    });
  });

  socket.on('sendMessage', async ({ message, params }) => {
    const user = findUser(params);
    const chatMessage = new ChatMessage({
      sender: params.name,
      text: message,
      socketId: socket.id,
      room: params.room,
      date: (new Date().toISOString().slice(0,10).split('-').reverse().join('.')),
      time: new Date().toLocaleTimeString(),
    });
    try {
      await chatMessage.save();
      if (user) {
        io.to(user.room).emit('message', { data: { user, message ,chatMessage} });
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('leftRoom', async ({ params }) => {
    const user = removeUser(params);

    if (user) {
      const { room, name } = user;
      io.to(user.room).emit('message', {
        data: { user: { name: 'Admin' }, message: `${name} has left` },
      });
      io.to(user.room).emit('joinRoom', {
        data: { users: getRoomUsers(room) },
      });
    }
  });

  socket.on('getChatHistory', (room) => {
    if (room.length > 0) {
      ChatMessage.find({ room: room })
        .then((chatMessages) => {
          console.log('rr', room);
          socket.emit('chatHistory', { data: chatMessages });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  io.on('disconnect', () => {
    console.log('Disconnect');
  });
});

app.use(
  cors({
    origin: '*',
  }),
);

app.use(express.json());
app.use('/auth', authRouter);
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
app.post('/chatall',async function(req,res){
  const { username } = req.body
  const curUser =  await User.findOne({ username });
  const kek = ChatMessage.find({ room: 'main' })
  .then((chatMessages) => {
    const timeC = chatMessages.map((item)=>{
      var date1 =  new Date();
      const kek1 = curUser.time
      date1 = date1.setHours.apply(date1, kek1.split(":"));
      var date2 =  new Date();
      const kek2 = new Date().toLocaleTimeString()
      date2 = date2.setHours.apply(date2, kek2.split(":"));
      var diff = date1 < date2;
      console.log('date1',date1,'---','date2',date2)
      const now = (new Date().toISOString().slice(0,10).split('-').reverse().join('.'))
      const nowTime = new Date().toLocaleTimeString()
      if(item.date === now && item.sender !== username && diff===true ){
          return item
        }
    })
    
    res.json(timeC);
  })
  .catch((err) => {
    console.error(err);
  });
  // try {
  //    const chat = ChatMessage.find({room: 'main'})
  //    console.log('chat',chat)
  //    res.json(chat);
     

  // } catch (error) {
  //   console.log(error);
  //   res.status(400).json({ message: 'Error all chat' });
  // }
})
app.use(express.static(__dirname));

const upload = multer({ storage: storageConfig });
app.post('/upload', upload.single('filedata'), async function (req, res, next) {
  let filedata = req.file;
  console.log(filedata);
  try {
    console.log('------------', req);
    const oldUsername = req.body.oldUsername;
    const currentUser = await User.findOne({ username: oldUsername });
    if (!currentUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    currentUser.avatar = `/${filedata.path}`;
    await currentUser.save();
    res.json(currentUser.avatar);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Ошибка при обновлении аватара' });
  }
});
const start = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://novikovisergeevich:123@cluster0.osefsfh.mongodb.net/?retryWrites=true&w=majority`,
    );
    server.listen(process.env.PORT || 5000, () => console.log(`server statred on port ${PORT}`));
  } catch (error) {
    console.log(e);
  }
};

start();
