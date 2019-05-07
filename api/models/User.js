'use strict'

var mongoose = require('mongoose');

/***  my code */
//  create mongoDB schema
const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    log: [{
      description: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        default: new Date().toUTCString()
      }
    }]
  });
  //  create a model of this schema
//   const User = mongoose.model('User', userSchema);
  module.exports = mongoose.model('User', userSchema);
  