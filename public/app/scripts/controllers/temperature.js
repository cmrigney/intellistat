(function () {
'use strict';

  angular
    .module('intellistatApp')
    .controller('TemperatureController', TemperatureController);

  TemperatureController.$inject = ['$scope', 'SocketIOService'];
  function TemperatureController($scope, SocketIOService) {
    var vm = this;


    activate();

    ////////////////

    function activate() {
      SocketIOService.on($scope, 'temperature:current', function(temp, humid) {
        $scope.temp = temp;
        $scope.humid = humid;
      });

      SocketIOService.on($scope, 'temperature:read-error', function() {

      });

      SocketIOService.emit($scope, 'temperature:get', function(data) {
        $scope.temp = data.temp;
        $scope.setTemp = data.setTemp;
      });

      $scope.changeTemp = function(i) {
        $scope.setTemp += i;
        SocketIOService.emit($scope, 'temperature:update', $scope.setTemp);
      };
    }
  }
})();