fs = require 'fs'
express = require 'express'
http = require 'http'

app = express()
server = http.createServer(app)
io = require('socket.io').listen(server)

# Config
port = 8080
slideDirectory = 'public/img/slides'
slideUrl = 'img/slides'

server.listen(port, '0.0.0.0')

app.use express.static __dirname + '/public'

app.get '/', (req, res) ->
    res.sendfile __dirname + '/index.html'

currentSlide = 0

io.sockets.on 'connection', (socket) ->
    socket.on 'presenter present', (data) ->
        socket.set 'presenter', true, ->
            currentSlide = 0
            fs.readdir slideDirectory, (err, files) ->
                if err
                    return console.error "Could not get slides from #{slideDirectory}"
                socket.emit 'init presenter', {path: slideUrl, slides: files}
        socket.broadcast.emit 'reload'

    socket.on 'viewer present', (data) ->
        socket.set 'presenter', false, ->
            fs.readdir slideDirectory, (err, files) ->
                if err
                    return console.error "Could not get slides from #{slideDirectory}"
                socket.emit 'init', {path: slideUrl, slides: files, current: currentSlide}

    socket.on 'slide to', (data) ->
        # if socket.get 'presenter', ->
        socket.broadcast.emit 'slide to', data
        currentSlide = data.slide_num

