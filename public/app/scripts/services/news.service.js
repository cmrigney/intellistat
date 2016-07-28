(function() {
'use strict';

  angular
    .module('intellistatApp')
    .service('NewsService', NewsService);

  NewsService.$inject = ['$resource'];
  function NewsService($resource) {
    return {
      articles: $resource('https://newsapi.org/v1/articles', {}, {})
    }; 
  }
})();