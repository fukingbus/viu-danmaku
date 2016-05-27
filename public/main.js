/*global $
  global videojs
*/
var socket,danmakuEngine;

$(function() {
    var player = videojs('player');
	player.play();
	connectSocket();
	danmakuEngine = new Danmaku();
	danmakuEngine.init({
      engine: 'dom',
      container: document.getElementById('danmakuContainer')
    });
});
$(document).keypress(function (e) {
        if (e.which == 13) {
            toggleDanmakuPanel();
        }
});
$(window).resize(function(){
    danmakuEngine.resize();
});

function toggleDanmakuPanel(){
    onShow = ($('#danmakuPanelContainer').css('display') == 'block');
    if(onShow){
        if($('.danmakuPanel').val() == 0)
            $('#danmakuPanelContainer').fadeOut(300);
        else{
            danmakuStr = $('.danmakuPanel').val();
            if(socket.connected)
                submitDanmaku(danmakuStr);
            else{
                popWarning('從彈幕伺服器斷線');
                socket.connect();
            }
            $('.danmakuPanel').val('');
            $('#danmakuPanelContainer').fadeOut(300);
        }   
    }
    else{
        $('#danmakuPanelContainer').fadeIn(300);
        $('.danmakuPanel').focus();
    }
}

function submitDanmaku(msg){
    socket.emit('submitDanmaku',msg);
}
function connectSocket(){
    socket = io();
    socket.on('postDanmaku', function(msg){
        popDanmaku(msg);
    });
    socket.on('onlineStatus', function(status){
        $('#currentOnline').text('線上: '+status);
    });
    socket.on('programmeStatus', function(obj){
        console.log(obj);
        progName = obj[0].program_title + ' → ' + obj[1].program_title;
        $('#currentProgramme').text(progName);
        setInterval(function () {
            timeNow = new Date().getTime();
            diff = obj[0].end - timeNow;
            var ms = diff % 1000;
              diff = (diff - ms) / 1000;
              var secs = diff % 60;
              diff = (diff - secs) / 60;
              var mins = diff % 60;
              var hrs = (diff - mins) / 60;
              secs = (secs<10 ? '0':'')+secs; 
              mins = (mins<10 ? '0':'')+mins; 
              hrs = (hrs<10 ? '0':'')+hrs;
            $('#timer').text(hrs+':'+mins+':'+secs);
        }, 1000);
    });
}
function popDanmaku(msg){
    var comment = {
      text: msg,
      mode: 'rtl',
      style: {
        fontSize: '48px',
        color: '#ffffff',
        textShadow: '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000'
      }
    };
    danmakuEngine.emit(comment);
}
function popWarning(msg){
    var comment = {
      text: msg,
      mode: 'top',
      style: {
        fontSize: '36px',
        color: '#FF5252',
        textShadow: '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000'
      }
    };
    danmakuEngine.emit(comment);
}