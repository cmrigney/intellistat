module.exports = function(app, io) {
  require('./controllers/fmradio.js').SetupRoutes(app, io);
  require('./controllers/temperature.js').SetupRoutes(app, io);
};