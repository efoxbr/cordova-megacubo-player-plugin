var exec = require('cordova/exec')
function MegacuboPlayer() {
    var self = this;
    self.appMetrics = {top:0, bottom: 0, right: 0, left: 0};
    self.on = function (type, cb){
        if(typeof(self.events[type]) == 'undefined'){
            self.events[type] = []
        }
        if(self.events[type].indexOf(cb) == -1){
            self.events[type].push(cb)
        }
    }
    self.off = function (type, cb){
        if(typeof(self.events[type]) != 'undefined'){
            if(typeof(cb) == 'function'){
                let i = self.events[type].indexOf(cb)
                if(i != -1){
                    self.events[type].splice(i, 1)
                }
            } else {
                delete self.events[type]
            }
        }
    }
    self.emit = function (){
        var a = Array.from(arguments)
        var type = a.shift()
        if(typeof(self.events[type]) != 'undefined'){
            self.events[type].forEach(function (f){
                f.apply(null, a)
            })
        }
    }
    self.play = function(uri, mimetype, cookie, success, error) {
        exec(success, error, "cordova-megacubo-player-plugin", "play", [uri, mimetype, cookie])
    }
    self.stop = function(success, error) {
        exec(success, error, "cordova-megacubo-player-plugin", "stop", [])
    }
    self.pause = function(success, error) {
        exec(success, error, "cordova-megacubo-player-plugin", "pause", [])
    }
    self.resume = function(success, error) {
        exec(success, error, "cordova-megacubo-player-plugin", "resume", [])
    }
    self.mute = function(success, error) {
        exec(success, error, "cordova-megacubo-player-plugin", "mute", [])
    }
    self.unMute = function(success, error) {
        exec(success, error, "cordova-megacubo-player-plugin", "unMute", [])
    }
    self.restartApp = function(success, error) {
        exec(success, error, "cordova-megacubo-player-plugin", "restart", [])
    }
    self.getAppMetrics = function(success, error) {
        exec(success, error, "cordova-megacubo-player-plugin", "getAppMetrics", [])
    }
    self.seek = function(to, success, error) {
        clearTimeout(self.seekTimer)
        exec(success, error, "cordova-megacubo-player-plugin", "seek", [to])
        self.emit('timeupdate')
    }
    self.ratio = function(r, success, error) {
        if(typeof(r) == 'number' && !isNaN(r)){
			if(r != self.aspectRatio){
				exec(success, error, "cordova-megacubo-player-plugin", "ratio", [r])
			}
		} else {
			console.error('BAD RATIO VALUE '+ typeof(r), r)
		}
    }
    self.onTrackingEvent = e => {
        if(e.data && ['{', '"'].indexOf(e.data.charAt(0)) != -1){
            e.data = JSON.parse(e.data)
        }
        self.emit(e.type, e.data)
    }
    self.init = () => {
        self.seekTimer = 0
        self.events = {}
        self.on('ratio', e => {
            self.aspectRatio = e.ratio
            self.videoWidth = e.width
            self.videoHeight = e.height
        })
        self.on('appMetrics', e => {
            self.appMetrics = e
            self.emit('appmetrics', e)
        })
        self.on('time', e => {
            e.currentTime = e.currentTime / 1000;
            e.duration = e.duration / 1000;
            if(e.duration < e.currentTime){
                e.duration = e.currentTime + 1;
            }
            if(e.currentTime > 0 && e.currentTime != self.currentTime){
                self.currentTime = e.currentTime
                self.emit('timeupdate')
            }
            if(e.duration != self.duration){
                self.duration = e.duration
                self.emit('durationchange')
            }
        })
        exec(self.onTrackingEvent, function() {}, "cordova-megacubo-player-plugin", "bind", [navigator.userAgent])
        exec(() => {}, console.error, "cordova-megacubo-player-plugin", "getAppMetrics", [])
    }
    self.init()
}
cordova.addConstructor(function (){
	if (!window.plugins) {
		window.plugins = {};
	}
	window.plugins.megacubo = new MegacuboPlayer()
    return window.plugins.megacubo;
})
