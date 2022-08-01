const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})


app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send(
        "welcome to chatonus!"
    )
})

// socket connection

io.on('connection', (socket) => {
    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
        socket.broadcast.emit('callended');

        socket.on('calluser', ({ userToCall, signalData, from, name }) => {
            io.on(userToCall).emit('clluser', { signale: signalData, from, name })
        })

        socket.on('answercall', (data) => {
            io.to(data.to).emit('callaccepted', data.signal)
        })
    })
})




server.listen(PORT, (req, res) => console.log(`listening on ${PORT}`))


