const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { getAliens } = require('./controllers/aliens.controllers');
const { getEndpoints } = require('./controllers/api.controllers');
const { getQuestions } = require('./controllers/questions.controllers');
const { getUsers, postUsers } = require('./controllers/users.controllers');
const {
  handleMongoErrors,
  handleCustomErrors,
  handleInternalErrors,
} = require('./errors/errors');
const cors = require('cors');
const connectDB = require('./db/connectMongo');

const port = process.env.PORT || 8080;

const io = require('socket.io')(server, {
  cors: { origin: ['https://guess-what-gitkermit.netlify.app', "http://localhost:3000" ]},
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});

let arr = [];
let playingArray = [];
let alienArray = [];

console.log(arr, "<<<<<< arr")
console.log(playingArray, "<<<<< playArray")
console.log(alienArray, "<<<<< alienArray")

io.on('connection', (socket) => {
  console.log("socket connection successful")
  socket.on('find', (e) => {
    socket.emit('your-socketid', socket.id);
    console.log(socket.id, "<<<<<socket.id");
    console.log(e, "<<<<<<<< e");
    console.log(e.name, "<<<<<<< e.name")
    console.log(typeof e.name, "<<<<<<< type of e.name");
    if (e.name !== null && e.name !== "") {
      arr.push({ name: e.name, socket_id: socket.id });
      alienArray.push(e.aliens);

      if (arr.length === 2 & arr[0].socket_id === arr[1].socket_id) {
        alienArray.shift()
      }

      if (arr.length === 2 && arr[0].socket_id !== arr[1].socket_id) {
        let p1obj = {
          p1name: arr[0].name,
          p1socketId: arr[0].socket_id,
          p1alien: alienArray[0][Math.floor(Math.random() * 24)],
        };
        let p2obj = {
          p2name: arr[1].name,
          p2socketId: arr[1].socket_id,
          p2alien: alienArray[0][Math.floor(Math.random() * 24)],
        };

        let obj = {
          p1: p1obj,
          p2: p2obj,
          allAliens: alienArray[0],
        };
        playingArray.push(obj);

        console.log(playingArray, "<<<<<< playing array")

        arr.splice(0, 2);
        alienArray.splice(0, 2);

        io.emit('find', { allPlayers: playingArray });

        playingArray.splice(0, 1);
      }
    }
  });
  socket.on('start-game', () => {
    io.emit('proceed');
  });
});

require('dotenv').config();

connectDB();

app.use(cors({origin: "*"}));

app.use(express.json());

app.get('/api', getEndpoints);

app.get('/api/aliens', getAliens);

app.get('/api/questions', getQuestions);

app.get('/api/users', getUsers);

app.post('/api/users', postUsers);

// app.get("/api/aliens/names", getAliensNames);

app.all('*', (_, res) => res.status(404).send({ msg: 'Not Found' }));

app.use(handleMongoErrors);

app.use(handleCustomErrors);

app.use(handleInternalErrors);

module.exports = app;
