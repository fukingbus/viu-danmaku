var crossdomain = require('crossdomain'),
    logger = require('morgan'),
    http = require('http'),
    request = require('request'),
    cors = require('cors');
var express = require('express');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var antiSpammer = require('socket-anti-spam');
var currentOnline = 0;
var todayEpg = [];
var currentProg,nextProg;
var epgUpdateTimer,programmeUpdateTimer;

antiSpammer.init({
    banTime: 30,            // Ban time in minutes
    kickThreshold: 2,       // User gets kicked after this many spam score
    kickTimesBeforeBan: 5,  // User gets banned after this many kicks
    banning: true,          // Uses temp IP banning after kickTimesBeforeBan
    heartBeatStale: 40,     // Removes a heartbeat after this many seconds
    heartBeatCheck: 4,      // Checks a heartbeat per this many seconds
    io: io,          // Bind the socket.io variable
});
httpServer.listen(8080, function(){
  console.log(new Date().toISOString() + ": server started on port 8081");
    setTimeout(parseEPG, 1000 * 60 * 60 * 3);
    parseEPG();
    io.on('connection', function(socket){
        console.log('[Connect]' + socket.id);
            currentOnline++;
            io.sockets.emit('onlineStatus',currentOnline);
            socket.emit('programmeStatus',[currentProg,nextProg]);
            socket.on('disconnect', function(){
                currentOnline--;
                console.log('[Drop]'+socket.id);
                io.sockets.emit('onlineStatus',currentOnline);
            });
            socket.on('submitDanmaku', function(content){
                if(new Date().getTime() - socket.lastMsgTime > 5000 || socket.lastMsgTime==null){
                    currDate = new Date();
                    dateStr = currDate.getHours() + ":" + currDate.getMinutes() + ":" + currDate.getSeconds();
                    if(content.msg.length <= 32){
                        console.log('['+dateStr+']'+socket.id+':'+content.msg+' '+content.mode);
                        io.sockets.emit('postDanmaku',content);
                        socket.lastMsgTime = currDate.getTime();
                    }
                }

            });
    });
});

function parseEPG(){
    console.log('Parsing latest EPG...')
    request('http://viu.tv/epg/99', function (error, response, body) {
      if (!error && response.statusCode == 200) {
          var regexp = /<script>setTimeout\(changeLiveIndicator, 0\);\n\nvar epgs = (.*);/gmi;
          var chopped = regexp.exec(body);
          var epgs = JSON.parse(chopped[1]);
          var today = new Date();
          var todayStr = today.getFullYear() +''+ ((today.getMonth()+1)<10 ? '0':'')+(today.getMonth()+1) +''+ ((today.getDate())<10 ? '0':'')+(today.getDate());
          var tomorrowStr = today.getFullYear() +''+ ((today.getMonth()+1)<10 ? '0':'')+(today.getMonth()+1) +''+ ((today.getDate()+1)<10 ? '0':'')+(today.getDate()+1);
          todayEpg = [];
          epgs.forEach(function(entry) {
              if(entry.date == todayStr || entry.date == tomorrowStr)
                todayEpg.push(entry);
          });
          findEPG();
      }
    });

}
function findEPG(){
    var timeNow = new Date().getTime();
          for(var i=0;i<todayEpg.length;i++){
              if(todayEpg[i].end > timeNow && todayEpg[i].start < timeNow){
                currentProg = todayEpg[i];
                nextProg = todayEpg[i+1];
                break;
              }
          }
          resetUpdateTimer();
          console.log('Current Prog: '+currentProg.program_title);
          io.sockets.emit('programmeStatus',[currentProg,nextProg]);
}
function resetUpdateTimer(){
    var timeNow = new Date().getTime();
    var diff = currentProg.end - timeNow;
    programmeUpdateTimer = setTimeout(findEPG, diff);
}


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
