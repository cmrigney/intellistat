module.exports = function(app, io) {
  require('./controllers/fmradio.js').SetupRoutes(app, io);
};