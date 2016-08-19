(function() {
'use strict';

  angular
    .module('intellistatApp')
    .controller('FMController', FMController);

  FMController.$inject = ['$scope', 'SocketIOService'];
  function FMController($scope, SocketIOService) {
    var vm = this;
    

    activate();

    function bindProp(propName) {
      return function(val) {
        $scope[propName] = val;
      };
    }

    ////////////////

    function activate() {
      //Init
      $scope.volume = 5;
      SocketIOService.emit($scope, 'fm:get-state', function(state) {
        $scope.power = state.power;
        $scope.channel = state.channel;
      });
      SocketIOService.emit($scope, 'fm:set-volume', $scope.volume);

      //Events
      SocketIOService.on($scope, 'fm:power-changed', bindProp('power'));
      SocketIOService.on($scope, 'fm:channel-changed', bindProp('channel'));
      SocketIOService.on($scope, 'fm:volume-changed', bindProp('volume'));

      //TODO error event

      //Methods
      $scope.togglePower = function() {
        SocketIOService.emit($scope, 'fm:toggle-power');
      };
      $scope.setChannel = function() {
        SocketIOService.emit($scope, 'fm:set-channel', $scope.channel);
      };
      $scope.seekUp = function() {
        SocketIOService.emit($scope, 'fm:seek-up');
      };
      $scope.seekDown = function() {
        SocketIOService.emit($scope, 'fm:seek-down');
      };
      $scope.readRDS = function() {
        SocketIOService.emit($scope, 'fm:read-rds', function(rds) {
          $scope.rds = rds;
        });
      };
      $scope.setVolume = function(vol) {
        SocketIOService.emit($scope, 'fm:set-volume', vol);
      };
      $scope.volumeUp = function() {
        $scope.setVolume($scope.volume + 1);
      };
      $scope.volumeDown = function() {
        $scope.setVolume($scope.volume - 1);
      };

    }
  }
})();