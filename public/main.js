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