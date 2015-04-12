news

.controller('FeedController', ['$scope','$rootScope','$location','$route','news', function($scope,$rootScope,$location,$route,news) {
    console.log( 'rss' )
    
    // List of available feeds:
    $scope.feeds = news.feeds;
    
    // Scope search:
    $scope.s = $rootScope.s ? $rootScope : '';
    $scope.id = $route.current.params.feed
    $scope.feed = null;
    
    news.sync(function(){
        
        try { $scope.$digest(); } catch (e) {}
        
    },$scope);
    
    $scope.sync = function() {
        
        news.sync(function(){
            alert('synced ok');
        })
        
    }
    
    $scope.change = function() {
        location.hash = '#/' + $scope.id;
    }
}])

;