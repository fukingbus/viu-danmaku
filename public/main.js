/*global $
  global videojs
*/
var socket,danmakuEngine,countdown,tipsTimer;
var danmakuMode = 'rtl';
var tipsArr = [
        '若聲畫不同步或無聲，請重新載入 (F5)',
        '歡迎向開發人員提交建議',
        '若出現錯誤 請重新載入',
        '右下角可以選擇聲道',
        '按 Enter 輸入彈幕 再按一次送出',
];
var initTipsArr = [
    '歡迎！若聲畫不同步或無聲，請重新載入 (F5)',
    '歡迎！按 Enter 輸入彈幕 再按一次送出'
];

$(function() {
  if (!(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1)) {
    videojs('player').ready(function(){
      this.play();
      $( '.vjs-audio-button > .vjs-menu > .vjs-menu-content > li' ).each(function( index ) {
            if($(this).text()=='chi_1, selected')
                $(this).text('粵語');
            else
                $(this).text('原始');
        });
    });
  }

	connectSocket();
	danmakuEngine = new Danmaku();
	danmakuEngine.init({
      engine: 'dom',
      container: document.getElementById('danmakuContainer')
    });
<<<<<<< HEAD
    tipsMsg = getRandomTips(true);
    var initTips ={
        'msg': tipsMsg,
        'mode':'bottom'
    };
    popDanmaku(initTips);
    popTips();
    tipsTimer = setInterval(popTips, 15000);
=======

>>>>>>> e4c36ca855d3bde02cb4e529459d9afea1f75b8b
});

$(document).keypress(function (e) {
        if (e.which == 13) {
            toggleDanmakuPanel();
        }
});
$(window).resize(function(){
    danmakuEngine.resize();
});
$( "#set-dmk-top" ).click(function() {
  danmakuMode = 'top';
});
$( "#set-dmk-bottom" ).click(function() {
  danmakuMode = 'bottom';
});
$( "#set-dmk-scroll" ).click(function() {
  danmakuMode = 'rtl';
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
    var content = {
        'msg':msg,
        'mode':danmakuMode
    }
    socket.emit('submitDanmaku',content);
    danmakuMode = 'rtl';
}
function connectSocket(){
    socket = io();
    socket.on('postDanmaku', function(content){
        console.log(content);
        popDanmaku(content);
    });
    socket.on('onlineStatus', function(status){
        $('#currentOnline').text('線上: '+status);
    });
    socket.on('programmeStatus', function(obj){
        console.log(obj);
        progName = obj[0].program_title + ' → ' + obj[1].program_title;
        $('#currentProgramme').text(progName);
        clearInterval(countdown);
        countdown = setInterval(function () {
            timeNow = new Date().getTime();
            diff = obj[0].end - timeNow;
            if(diff>0){
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
            }
            else
                clearInterval(countdown);
        }, 1000);
    });
}
function popDanmaku(content){
    var comment = {
      text: content.msg,
      mode: content.mode,
      style: {
        fontSize: 48-content.msg.length,
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
<<<<<<< HEAD
function getRandomTips(isInitTips){
    arr = isInitTips ? initTipsArr : tipsArr;
    return arr[Math.floor(Math.random() * arr.length)];
}
function popTips(){
    $('#tips').hide();
    $('#tips').text(getRandomTips(false));
    $('#tips').fadeIn(300);
}
=======
>>>>>>> e4c36ca855d3bde02cb4e529459d9afea1f75b8b
