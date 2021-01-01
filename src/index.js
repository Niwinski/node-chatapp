const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { callbackify } = require("util");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require("./utils/users");

const publicPath = path.join(__dirname, "..", "public");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
app.use(express.static(publicPath));
app.use(express.json());

let count = 0;

io.on("connection", (socket) => {
    console.log("new connection");

    socket.on("newMsg", (msg, cb) => {
        try {
            const room = getUser(socket.id).room;
            io.to(room).emit(
                "msg",
                generateMessage(getUser(socket.id).username, msg)
            );
        } catch {
            // ignore bad users.
        }
        // const badwords = new Filter();
        // if (badwords.isProfane(msg)) {
        //     return cb("no profanity");
        // }
        // console.log("got ", msg);
        cb();
    });

    socket.on("myLoc", (msg, cb) => {
        console.log("loc ", msg);
        const room = getUser(socket.id).room;

        io.to(room).emit(
            "linkMsg",
            generateMessage(
                getUser(socket.id).username,
                `https://www.google.com/maps/?q=${msg.lat},${msg.long}`
            )
        );
        cb();
    });

    socket.on("join", ({ username, room }, cb) => {
        // console.log(username, room);
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return cb(error);
        }
        socket.join(user.room);
        socket.emit("msg", generateMessage("Admin", "welcome to the game"));
        socket.broadcast
            .to(user.room)
            .emit(
                "msg",
                generateMessage(
                    "Admin",
                    `${user.username} has entered the arena`
                )
            );

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
        cb();
    });

    // socket.emit("countUpdated", count);

    // socket.on("increment", () => {
    //     count++;
    //     //socket.emit("countUpdated", count);
    //     io.emit("countUpdated", count);
    // });
    socket.on("disconnect", () => {
        console.log("bam connection for ", socket.id);
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit(
                "msg",
                generateMessage("admin", `${user.username} said laters`)
            );
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    });
});

server.listen(port, (params) => {
    console.log("listening on " + port);
});
