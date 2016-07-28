(function() {
'use strict';

  angular
    .module('intellistatApp')
    .controller('NewsController', NewsController);

  NewsController.$inject = ['$scope', 'NewsService'];
  function NewsController($scope, NewsService) {
    var vm = this;

    activate();

    ////////////////

    function activate() {
      $scope.loadingNews = true;
      NewsService.articles.get({
        apiKey: '@@APIKEY',
        source: 'cnn',
        sortBy: 'top'
      }).$promise.then(function(data) {
        $scope.news = data;
        $scope.news.articles.splice(0, 1);
        console.log($scope.news);
        $scope.loadingNews = false;
      });
    }
  }
})();