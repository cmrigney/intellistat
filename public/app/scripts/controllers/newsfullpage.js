(function() {
'use strict';

  angular
    .module('intellistatApp')
    .controller('NewsFullController', NewsFullController);

  NewsFullController.$inject = ['$scope', '$route', 'NewsService', '$sce'];
  function NewsFullController($scope, $route, NewsService, $sce) {
    var vm = this;
    

    activate();

    ////////////////

    function activate() {
      $scope.newsUrl = $sce.trustAsResourceUrl(NewsService.selectedNews);
    }
  }
})();