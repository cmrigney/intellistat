'use strict';

var Promise = require('bluebird');
var Controller = require('./base.js');
var pins = require('../pins.js');
var gpio = require('rpi-gpio');

var dht = require('node-dht-sensor');
/*
var dht = {
  initialize: function() {},
  read: function() { return { temperature: 25, humidity: 50, isValid: true }; }
};
*/

const MODE = {
  Heat: 1,
  Cool: 2
};

const BUFFER = 2;

class TemperatureController extends Controller {
  constructor() {
    super();
    dht.initialize(22, 4);
    this.setTemperature = 70;
    this.mode = MODE.Heat;
    gpio.setMode(gpio.MODE_BCM);
    gpio.setup(pins.HeatRelay, gpio.DIR_OUT, (err) => { if(err) console.log(err) });
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
        this._checkShouldTurnOn();
        this._checkShouldTurnOff();
      }
      else {
        this.io.emit('temperature:read-error');
        //TODO try again
      }
    }

    setTimeout(this._takeReading.bind(this), 30*1000);
  }

  _checkShouldTurnOn() {
    if(this.mode === MODE.Heat && this.temperature && (this.setTemperature - this.temperature) >= BUFFER && !this.furnaceOn) {
      //turn on heat until set to temp
      this.furnaceOn = true;
      gpio.write(pins.HeatRelay, true, (err) => {
        //TODO handle error
      });
    }
  }

  _checkShouldTurnOff() {
    if(this.furnaceOn && (this.setTemperature - this.temperature) <= 0 && !this.turningFurnaceOff) {
      this.turningFurnaceOff = true;
      setTimeout(this._turnOffFurnace.bind(this), 30*1000);
    }
  }

  _turnOffFurnace() {
    gpio.write(pins.HeatRelay, false, (err) => {
      if(err)
        setTimeout(this._turnOffFurnace.bind(this), 100); //try again!
        //TODO handle error?
      else {
        this.furnaceOn = false;
        this.turningFurnaceOff = false;
      }
    });
  }

  _updateSetTemperature(temp) {
    this.setTemperature = temp;

    this._checkShouldTurnOn();
    this._checkShouldTurnOff();
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
