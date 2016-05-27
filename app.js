var crossdomain = require('crossdomain'),
    logger = require('morgan'),
    cors = require('cors');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var antiSpammer = require('socket-anti-spam');
var currentOnline = 0;
antiSpammer.init({
    banTime: 30,            // Ban time in minutes
    kickThreshold: 2,       // User gets kicked after this many spam score
    kickTimesBeforeBan: 5,  // User gets banned after this many kicks
    banning: true,          // Uses temp IP banning after kickTimesBeforeBan 
    heartBeatStale: 40,     // Removes a heartbeat after this many seconds 
    heartBeatCheck: 4,      // Checks a heartbeat per this many seconds 
    io: io,          // Bind the socket.io variable
});
http.listen(8081, function(){
  console.log(new Date().toISOString() + ": server started on port 8081");
    io.on('connection', function(socket){
        currentOnline++;
        console.log('[Connect]' + socket.id);
        io.sockets.emit('onlineStatus',currentOnline);
        socket.on('disconnect', function(){
            currentOnline--;
            console.log('[Drop]'+socket.id);
            io.sockets.emit('onlineStatus',currentOnline);
        });
        socket.on('submitDanmaku', function(msg){
            if(new Date().getTime() - socket.lastMsgTime > 5000 || socket.lastMsgTime==null){
                currDate = new Date();
                dateStr = currDate.getHours() + ":" + currDate.getMinutes() + ":" + currDate.getSeconds();
                if(msg.length <= 64){
                    console.log('['+dateStr+']:'+msg);
                    io.sockets.emit('postDanmaku',msg);
                    socket.lastMsgTime = currDate.getTime();
                }
            }
            
        });
    });
});




// CORS setting --start
var xml = crossdomain({domain: '*'});
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    res.render('index.html');
});

module.exports = app;
