const express = require("express");
const helmet = require("helmet");
const { Server } = require("socket.io");
const cors = require("cors");
const authRouter = require("./routers/authRouter");
const redisClient = require("./redis");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
require("dotenv").config();

const app = express();
const server = require("http").createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: "true",
  },
});

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    credentials: true,
    name: "sid",
    store: new RedisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.ENVIRONMENT === "production" ? "true" : "auto",
      httpOnly: true,
      expires: 1000 * 60 * 60 * 24 * 7,
      sameSite: process.env.ENVIRONMENT === "production" ? "none" : "lax",
    },
  })
);

app.use("/auth", authRouter);

io.on("connect", (socket) => {});

server.listen(4000, () => {
  console.log("Server listenting on port 4000");
});
