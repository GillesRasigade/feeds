news

.controller('FeedController', ['$scope','$rootScope','$location','$route','news', function($scope,$rootScope,$location,$route,news) {
    console.log( 'rss' )
    
    // List of available feeds:
    $scope.feeds = news.feeds;
    
    // Scope search:
    $scope.s = $rootScope.s ? $rootScope : '';
    $scope.id = $route.current.params.feed
    $scope.feed = null;
    $scope.syncing = false;
    
    $scope.sync = function( id ) {
        
        news.sync(function(){
            
            $scope.syncing = false;
            try { $scope.$digest(); } catch (e) {}
            
        },$scope,id)
        
    }
    
    $scope.scroll = function() {
        console.log( arguments );
    }
    
    $scope.change = function() {
        location.hash = '#/' + $scope.id;
    }
    
    $scope.sync( $scope.id )
    
}])

;