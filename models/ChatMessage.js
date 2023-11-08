const { Schema, model } = require('mongoose');

const ChatMessage = new mongoose.Schema({
    sender: String,
    text: String,
    socketId: String,
    room: String,
    date: String,
    time:String,
  });



module.exports = model('ChatMessage', ChatMessage);