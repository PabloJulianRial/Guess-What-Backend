const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { getAliens } = require("./controllers/aliens.controllers");
const { getEndpoints } = require("./controllers/api.controllers");
const { getQuestions } = require("./controllers/questions.controllers");
const { getUsers, postUsers } = require("./controllers/users.controllers");
const {
  handleMongoErrors,
  handleCustomErrors,
  handleInternalErrors,
} = require("./errors/errors");
const cors = require("cors");
const connectDB = require("./db/connectMongo");

const port = process.env.PORT || 8080;

const io = require("socket.io")(server, {
  cors: {
    origin: [
      "https://peaceful-cupcake-57dcec.netlify.app",
      "https://spontaneous-valkyrie-34ea0c.netlify.app",
      "https://guess-what-gitkermit.netlify.app",
      "http://localhost:3000",
    ],
  },
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});

let arr = [];
let playingArray = [];
let alienArray = [];
let turnCounter = 0;

io.on("connection", (socket) => {
  console.log("socket connection successful");
  socket.on("find", (e) => {
    socket.emit("your-socketid", socket.id);
    if (e.name !== null && e.name !== "") {
      console.log(arr, "<<<<<<<< arr before check and push");

      arr.forEach((item, index) => {
        if (item.name === e.name) {
          arr.splice(index, 1);
          index -= 1;
        }
      });

      arr.push({ name: e.name, socket_id: socket.id });
      alienArray.push(e.aliens);

      if (arr.length >= 2 && arr[0].socket_id !== arr[1].socket_id) {
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

        io.emit("find", { allPlayers: playingArray });

        arr = [];
        alienArray = [];
        playingArray = [];
      }
    }
  });
  socket.on("start-game", () => {
    io.emit("proceed");
    turnCounter = 0;
  });

  socket.on("turnPlayed", () => {
    turnCounter += 1;
    io.emit("turnIncreased", turnCounter);
  });

  socket.on("winner", () => {
    io.emit("endGame");
  });

});

require("dotenv").config();

connectDB();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/aliens", getAliens);

app.get("/api/questions", getQuestions);

app.get("/api/users", getUsers);

app.post("/api/users", postUsers);

app.all("*", (_, res) => res.status(404).send({ msg: "Not Found" }));

app.use(handleMongoErrors);

app.use(handleCustomErrors);

app.use(handleInternalErrors);

module.exports = app;
