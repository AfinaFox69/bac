const { Schema, model } = require('mongoose');

const User = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: {type: String},
  info: {type: String, required: true},
  roles: [{ type: String, ref: 'Role' }],
  favorites: [{type:Object}],
  time: {type:String},
  emailRead: {type:Number}
});



module.exports = model('User', User);