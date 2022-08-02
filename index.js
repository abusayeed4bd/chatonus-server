const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

// ice server --------------------
var freeice = require('freeice');
var quickconnect = require('rtc-quickconnect');

// -----------------------------------------


const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Running');
});

// ice server------------------------------------
var qcOpts = {
    room: 'icetest',
    iceServers: freeice()
};

// go ahead and connect
quickconnect('http://rtc.io/switchboard', qcOpts)
    .createDataChannel('chat')
    .once('channel:opened:chat', function (peerId, dc) {
        console.log('data channel opened for peer id: ' + peerId);

        dc.onmessage = function (evt) {
            console.log('peer ' + peerId + ' says: ' + evt.data);
        };

        dc.send('hi');
    });





// ------------------------------------------------

io.on("connection", (socket) => {
    socket.emit("me", socket.id);

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded")
    });

    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit("callUser", { signal: signalData, from, name });
    });

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal)
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));