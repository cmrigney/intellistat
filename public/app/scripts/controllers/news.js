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
      $scope.news = NewsService.articles.get({
        apiKey: '6801d0675c7a414a9540136c00ee62ed',
        source: 'cnn',
        sortBy: 'top'
      }).$promise.then(function(data) {
        console.log(data);
        $scope.loadingNews = false;
      });
    }
  }
})();