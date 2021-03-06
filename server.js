// Generated by CoffeeScript 1.7.1
(function() {
  var app, currentSlide, express, fs, http, io, port, server, slideDirectory, slideUrl;

  fs = require('fs');

  express = require('express');

  http = require('http');

  app = express();

  server = http.createServer(app);

  io = require('socket.io').listen(server);

  port = 8080;

  slideDirectory = 'public/img/slides';

  slideUrl = 'img/slides';

  server.listen(port, '0.0.0.0');

  app.use(express["static"](__dirname + '/public'));

  app.get('/', function(req, res) {
    return res.sendfile(__dirname + '/index.html');
  });

  currentSlide = 0;

  io.sockets.on('connection', function(socket) {
    socket.on('presenter present', function(data) {
      socket.set('presenter', true, function() {
        currentSlide = 0;
        return fs.readdir(slideDirectory, function(err, files) {
          if (err) {
            return console.error("Could not get slides from " + slideDirectory);
          }
          return socket.emit('init presenter', {
            path: slideUrl,
            slides: files
          });
        });
      });
      return socket.broadcast.emit('reload');
    });
    socket.on('viewer present', function(data) {
      return socket.set('presenter', false, function() {
        return fs.readdir(slideDirectory, function(err, files) {
          if (err) {
            return console.error("Could not get slides from " + slideDirectory);
          }
          return socket.emit('init', {
            path: slideUrl,
            slides: files,
            current: currentSlide
          });
        });
      });
    });
    return socket.on('slide to', function(data) {
      socket.broadcast.emit('slide to', data);
      return currentSlide = data.slide_num;
    });
  });

}).call(this);
