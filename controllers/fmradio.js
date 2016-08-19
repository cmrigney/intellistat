'use strict';

var FMTuner = require('node-rpi-si4703');
var Promise = require('bluebird');
var Controller = require('./base.js');
var pins = require('../pins.js');

Promise.promisifyAll(FMTuner);

class FMRadioController extends Controller {
  constructor() {
    super();
    this.powerState = false; //off
    this.tuner = new FMTuner(pins.FMTunerReset, pins.FMTunerI2CSDSA);
  }

  SetupRoutes(app, io) {
    io.on('connection', (socket) => {
      function errorFn(err) {
        io.emit('server-error', err);
      }

      socket.on('fm:get-state', (cb) => {
        this.tuner.getChannelAsync()
        .then((channel) => {
          cb({ power: this.powerState, channel: channel });
        })
        .catch(errorFn);
      });

      socket.on('fm:get-power', (cb) => {
        cb(this.powerState);
      });

      socket.on('fm:toggle-power', () => {
        if(this.powerState) {
          this.tuner.powerOffAsync().then(() => {
            this.powerState = false;
            io.emit('fm:power-changed', false);
          }).catch(errorFn);
        }
        else {
          this.tuner.powerOnAsync().then(() => {
            this.powerState = true;
            io.emit('fm:power-changed', true);
          }).catch(errorFn);
        }
      });

      socket.on('fm:power-on', () => {
        if(this.powerState)
          return;
        this.tuner.powerOnAsync().then(() => {
          this.powerState = true;
          io.emit('fm:power-changed', true);
        }).catch(errorFn);
      });

      socket.on('fm:power-off', () => {
        if(!this.powerState)
          return;
        this.tuner.powerOffAsync().then(() => {
          this.powerState = false;
          io.emit('fm:power-changed', false);
        }).catch(errorFn);
      });

      socket.on('fm:set-channel', (channel) => {
        this.tuner.setChannelAsync(channel).then(() => {
          io.emit('fm:channel-changed', channel);
        }).catch(errorFn);
      });

      socket.on('fm:seek-up', () => {
        this.tuner.seekUpAsync()
        .then(this.tuner.getChannel.bind(this.tuner))
        .then((channel) => {
          io.emit('fm:channel-changed', channel);
        })
        .catch(errorFn);
      });

      socket.on('fm:seek-down', () => {
        this.tuner.seekDownAsync()
        .then(this.tuner.getChannelAsync.bind(this.tuner))
        .then((channel) => {
          io.emit('fm:channel-changed', channel);
        })
        .catch(errorFn);
      });

      socket.on('fm:read-rds', (cb) => {
        this.tuner.readRDSAsync()
        .then(cb)
        .catch(errorFn);
      });

      socket.on('fm:get-channel', (cb) => {
        this.tuner.getChannelAsync()
        .then(cb)
        .catch(errorFn);
      });

      socket.on('fm:set-volume', (volume) => {
        this.tuner.setVolumeAsync(volume).then(() => {
          io.emit('fm:volume-changed', volume);
        }).catch(errorFn);
      });

    });
  }
}



module.exports = new FMRadioController();