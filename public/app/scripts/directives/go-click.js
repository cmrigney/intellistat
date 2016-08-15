(function() {
  'use strict';

  angular
    .module('intellistatApp')
    .directive('goClick', goClick);

  goClick.$inject = ['$location'];
  function goClick($location) {
    return function ( scope, element, attrs ) {
      var path;

      attrs.$observe( 'goClick', function (val) {
        path = val;
      });

      element.bind( 'click', function () {
        scope.$apply( function () {
          $location.path( path );
        });
      });
    };
  }
})();