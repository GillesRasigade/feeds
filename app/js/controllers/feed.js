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
    
    
    var $s = angular.element( document.getElementById('s') ).val( $scope.s );
    $s.off('keyup').on('keyup',function(event){
        
        var charCode = event.which || event.keyCode;
        var charStr = String.fromCharCode(charCode);
        
        if (charCode == 27 ) {
            event.target.value = '';
        }
        
        if ( charCode == 27 || charCode == 8 || /[a-z0-9]/i.test(charStr)) {
            $scope.s = $rootScope = event.target.value;
            $scope.search();
        }
    })
    window.onkeypress = function(event){
        if ( document.getElementById('s') ) {
            document.getElementById('s').focus();
        }
    }
    
    $scope.search = function() {
        
        var sPattern = '.*' + $scope.s.replace(/ +/ , '.*' ) + '.*';
        console.log( 35 , sPattern );
        angular.forEach($scope.feed.entries,function(o,i){
            
            if (
                !o.title.match( new RegExp( sPattern , 'i' ) )
             && !o.content.match( new RegExp( sPattern , 'i' ) )
            ) {
                $scope.feed.entries[i].filtered = true;
            } else {
                $scope.feed.entries[i].filtered = false;
            }
            
            try { $scope.$digest(); } catch (e) {}
        });
        
    }
    
    $scope.sync( $scope.id )
}])

;