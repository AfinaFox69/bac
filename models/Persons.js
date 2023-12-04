const { Schema, model } = require('mongoose');

const Persons = new Schema({
  id: { type: String, unique: true, required: true },

  messages: [{type:Object}]
});



module.exports = model('Persons', Persons);