const mongoose = require('mongoose')
const { Schema } = mongoose

const questionSchema = new mongoose.Schema({
    alienProp: String,
    checkFor: mongoose.Schema.Types.Mixed,
    question: String
})
  
  const Question = mongoose.model('Question', questionSchema);
  
  module.exports = Question;