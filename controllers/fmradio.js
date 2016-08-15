'use strict';

//Currently not installed so this will break
//var FMTuner = require('node-rpi-si4703');
var FMTuner = null;
var Promise = require('bluebird');
var Controller = require('./base.js');

Promise.promisifyAll(FMTuner);

class FMRadioController extends Controller {
  constructor() {
    super();
    this.powerState = false; //off
  }

  SetupRoutes(app, io) {
    io.on('connection', (socket) => {
      function errorFn(err) {
        io.emit('server-error', err);
      }

      io.on('fm:power-on', () => {
        if(this.powerState)
          return;
        FMTuner.powerOnAsync().then(() => {
          this.powerState = true;
          io.emit('fm:power-changed', true);
        }).catch(errorFn);
      });

      io.on('fm:power-off', () => {
        if(!this.powerState)
          return;
        FMTuner.powerOffAsync().then(() => {
          this.powerState = false;
          io.emit('fm:power-changed', false);
        }).catch(errorFn);
      });

      io.on('fm:set-channel', (channel) => {
        FMTuner.setChannelAsync(channel).then(() => {
          io.emit('fm:channel-changed', channel);
        }).catch(errorFn);
      });

      io.on('fm:seek-up', () => {
        FMTuner.seekUpAsync()
        .then(FMTuner.getChannel.bind(FMTuner))
        .then((channel) => {
          io.emit('fm:channel-changed', channel);
        })
        .catch(errorFn);
      });

      io.on('fm:seek-down', () => {
        FMTuner.seekDownAsync()
        .then(FMTuner.getChannelAsync.bind(FMTuner))
        .then((channel) => {
          io.emit('fm:channel-changed', channel);
        })
        .catch(errorFn);
      });

      io.on('fm:read-rds', (cb) => {
        FMTuner.readRDSAsync()
        .then(cb)
        .catch(errorFn);
      });

      io.on('fm:get-channel', (cb) => {
        FMTuner.getChannelAsync()
        .then(cb)
        .catch(errorFn);
      });

      io.on('fm:set-volume', (volume) => {
        FMTuner.setVolumeAsync(volume).then(() => {
          io.emit('fm:volume-changed', volume);
        }).catch(errorFn);
      });

    });
  }
}



module.exports = new FMRadioController();