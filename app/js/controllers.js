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
    .when('/:feed', {
        controller:'FeedController',
        templateUrl:'partials/feed.html',
        reloadOnSearch: false
    })
    .otherwise({
        redirectTo:'/'
    });
});