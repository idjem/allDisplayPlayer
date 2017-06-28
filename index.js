'use strict';

const Vlc    = require('vlc-remote/player');
const defer  = require('nyks/promise/defer');

const startEvent = require('mout/random/randString')();
const randInt    = require('mout/random/randInt');
const promisify  = require('nyks/function/promisify');
const winapi     = require('winapi');

const getDisplaysList = promisify(winapi.GetDisplaysList);

class Player extends require('eventemitter-co') {
  constructor(options, chain) {
    super();
    this.options = this.options;
    chain = chain || console.log;
    this.players = [];
    var self = this;
    this.once(startEvent, function*(){
      var error = null;
      try{
        self.players = yield self.initPlayer();
        if(!self.players.length)
          throw 'no display detected';
        self.players[0].on('play' , self.emit.bind(self, 'play'));
      }catch(err){
        error = err;
      }
      chain(error, self);
    })

    this.emit(startEvent).catch(console.log)
  }

  stop(){
    this.players.forEach((player) => {
      player.stop()
    })
  }

  play(playlist){
    this.players.forEach((player) => {
      player.play(playlist.slice())
    })
  }

  *initPlayer(){
    var displaysList = yield getDisplaysList();
    displaysList = displaysList.map(display => {
      var defered = defer();
      var options = {
        'args' : {
          "video-on-top" : null,
          'video-x' : display.WorkingArea.X + (display.WorkingArea.Width / 2),
          'video-y' : display.WorkingArea.Y + (display.WorkingArea.Height / 2),
          'width'   : 1,
          'height'  : 1,
          'rc-host' :  '127.0.0.1:' + randInt(20000, 60000) 
        } 
      }
      var player = new Vlc(Object.assign({}, this.options, options), defered.chain);
      return defered;
    })
    var players = yield displaysList;
    return players;
  }

  playOnce(playlist){
    this.players.forEach((player) => {
      player.playOnce(playlist)
    })
  }
}


module.exports = Player;