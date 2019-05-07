'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./api/models/User');

// connection to the database MongoDB
// in the .env file, provide a MONGOLAB_URI which correspondent to your database online
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/exercise-track').then(() => {
    console.log('Connected to mongoDB');  
}).catch(e => {
    console.log('Error while DB connecting');
    console.log(e);
});

const app = express();

// we allow cross origin
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// transform the body to a json in order to take the response in json
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// we set the static files
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});


// create a new user
app.post('/api/exercise/new-user', (req, res) => {
  // if(req.body.username)
  User.findOne({username: req.body.username}, (err, user) => {
    // test if the user already exist
    if(user) {
      return res.send('Sorry but the user ',req.body.username,' already taken');
    }

    //oherwise we save him and we send the response
    new User({username: req.body.username})
      .save()
      .then(doc => res.json({username: doc.username, _id: doc.id}))
      .catch(err => res.json(err));
  });
});

// list all the users
app.get('/api/exercise/users', (req, res) => {
  User.find({}, 'username id')
    .then(docs => {
      res.json(docs);
    })
    .catch(err => res.json(err) );
});


// add a exercise to a paricular user
app.post('/api/exercise/add', (req, res) => {
  // because the date is optionally, we need to test whether date is there or not
  let date;
  if(req.body.date){
    date = req.body.date;
  } else {
    date = new Date();
  }

  // create the excercise which will be save
  const logger = {
    description: req.body.description, 
    duration: req.body.duration, 
    date: date
  };

  // finally we find the user by his id and we update him
  User.findByIdAndUpdate(req.body.userId, {$push: { log: logger}}, {new: true}).exec()
    .then( user => res.json({id: user.id, username: user.username, log: user.log[user.log.length-1]}))
    .catch( err => res.json(err) );
});

// get the logs
app.get('/api/exercise/log'/*?{userId}[&from][&to][&limit]*/, (req, res) => {
  User.findById(req.query.userId).exec()
  .then( user => {
    let newLog = user.log;

    // test if there is from & to option and/or limit option
    if (req.query.from){
      newLog = newLog.filter( x =>  x.date.getTime() > new Date(req.query.from).getTime() );
    }
    if (req.query.to){
      newLog = newLog.filter( x => x.date.getTime() < new Date(req.query.to).getTime());
    }
    if (req.query.limit){
      newLog = newLog.slice(0, req.query.limit > newLog.length ? newLog.length : req.query.limit);
    }
    user.log = newLog;
    // count the excercise
    let temp = user.toJSON();
    temp['count'] = newLog.length;

    return temp;
  })
  .then( result => res.json(result))
  .catch(err => res.json(err));
    
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your Node.js app is listening on port ' + listener.address().port)
});
