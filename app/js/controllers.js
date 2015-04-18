news

//Routes
.config(function($routeProvider) {
  $routeProvider
    .when('/logout', {
        controller:'LogoutController',
        templateUrl:'partials/login.html'
    })
    .when('/login', {
        controller:'LoginController',
        templateUrl:'partials/login.html'
    })
    .when('/search/:q?', {
        controller:'SearchController',
        templateUrl:'partials/search.html',
        reloadOnSearch: false
    })
    .when('/feeds', {
        controller:'FeedsController',
        templateUrl:'partials/feeds.html',
        reloadOnSearch: false
    })
    .when('/:feed', {
        controller:'FeedController',
        templateUrl:'partials/feed.html',
        reloadOnSearch: false
    })
    .otherwise({
        redirectTo:'/'
    });
});