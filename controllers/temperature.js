'use strict';

var Promise = require('bluebird');
var Controller = require('./base.js');

//var dht = require('node-dht-sensor');
var dht = {
  initialize: function() {},
  read: function() { return { temperature: 25, humidity: 50, isValid: true }; }
};

class TemperatureController extends Controller {
  constructor() {
    super();
    dht.initialize(22, 4);
    this.setTemperature = 70;
    this._takeReading();
  }

  _takeReading() {
    var values = dht.read();
    var temperature = values.temperature * 9.0/5.0 + 32;
    var humidity = values.humidity;
    var isValid = values.isValid;

    if(this.io) {
      if(isValid) {
        this.temperature = temperature;
        this.io.emit('temperature:current', temperature, humidity);
      }
      else {
        this.io.emit('temperature:read-error');
        //TODO try again
      }
    }

    setTimeout(this._takeReading.bind(this), 30*1000);
  }

  _updateSetTemperature(temp) {
    this.setTemperature = temp;

    //Check if needs turned on
  }

  SetupRoutes(app, io) {
    this.io = io;
    io.on('connection', (socket) => {
      socket.on('temperature:update', temp => {
        this._updateSetTemperature(temp);
      });

      socket.on('temperature:get', cb => {
        cb({ temp: this.temperature, setTemp: this.setTemperature });
      });
    });
  }
}

module.exports = new TemperatureController();