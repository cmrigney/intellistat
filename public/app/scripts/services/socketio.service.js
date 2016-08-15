'use strict';
(function() {

  angular
    .module('intellistatApp')
    .service('SocketIOService', SocketIOService);

  function SocketIOService($q, $timeout) {

    var connection = null;

    var service = {
      emit: emit,
      on: on,
      once: once,
      recycle: recycle,
    };

    return service;

    ////////////////////

    function emit($scope) {
      _ensureConnected();
      var args = [];

      for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
      }

      var socket = connection.socket;

      _waitForConnection($scope).then(function(cancelled) {
        if (cancelled)
          return;
        socket.emit.apply(socket, _replaceFuncArgs($scope, args));
      });
    }

    function on($scope, event, callback) {
      _ensureConnected();
      _waitForConnection($scope).then(function(cancelled) {
        if (cancelled)
          return;
        var socket = connection.socket;
        var newCallback = _wrapFuncWithApply($scope, callback);

        socket.on(event, newCallback);
        $scope.$on('$destroy', function() {
          socket.off(event, newCallback);
        });
      });
    }

    function once($scope, event, callback) {
      _ensureConnected();
      _waitForConnection($scope).then(function(cancelled) {
        if (cancelled)
          return;
        var socket = connection.socket;
        var newCallback = _wrapFuncWithApply($scope, callback);

        socket.once(event, newCallback);
        $scope.$on('$destroy', function() {
          socket.off(event, newCallback);
        });
      });
    }

    function recycle() {
      if (connection && connection.socket) {
        connection.socket.disconnect();
        connection.socket = null;
      }
    }

    ////////////////////

    function _createConnection() {
      var result = { isConnected: false };
      var sock = io.connect({
        rejectUnauthorized: true,
        forceNew: true
      });

      result.socket = sock;
      sock.on('connect', function() {
        result.isConnected = true;
      });
      sock.on('error', function() {
        result.isConnected = false;
      });
      sock.on('disconnect', function() {
        result.isConnected = false;
      });
      return result;
    }

    function _ensureConnected() {
      if (connection === null || connection.socket === null)
        connection = _createConnection();
    }

    function _getReplacementFunc($scope, func) {
      var isAlive = true;
      var unregisterDestroy = $scope.$on('$destroy', function() {
        isAlive = false;
      });

      return function() {
        if (!isAlive) {
          return; //if destroyed, don't execute callback
        }

        unregisterDestroy();
        // eslint-disable-next-line no-invalid-this
        var result = func.apply(this, arguments);

        $scope.$apply();
        return result;
      };
    }

    // This scopes out callbacks so they don't fire if the scope has been destroyed
    function _replaceFuncArgs($scope, args) {
      angular.forEach(args, function(arg) {
        if (typeof arg === 'function')
          // this is a callback
          arg = _getReplacementFunc($scope, arg);
      });

      return args;
    }

    function _waitForConnection($scope) {
      var isAlive = true;

      var unregisterDestroy = $scope.$on('$destroy', function() {
        isAlive = false;
      });

      return $q(function(resolve) {
        function checkConnected() {
          if (!isAlive) {
            resolve(true); //cancelled
            return;
          }

          if (connection.isConnected) {
            unregisterDestroy();
            resolve(false);
          }
          else
            $timeout(checkConnected, 100);
        }

        checkConnected();
      });
    }

    function _wrapFuncWithApply($scope, callback) {
      return function() {
        // eslint-disable-next-line no-invalid-this
        var result = callback.apply(this, arguments);
        $scope.$apply();
        return result;
      };
    }

  }
})();
