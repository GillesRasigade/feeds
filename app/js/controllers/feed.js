news

.controller('FeedController', ['$scope','$rootScope','$location','$route','news', function($scope,$rootScope,$location,$route,news) {
    console.log( 'rss' );
    
    // List of available feeds:
    news.getFeeds(function(feeds){
        $scope.feeds = feeds;
        console.log( 9 , 'feeds:' , feeds );
        try { $scope.$digest(); } catch (e) {}
    });
    
    // Scope search:
    $scope.s = $rootScope.s ? $rootScope.s : '';
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
            event.target.blur();
        }
            console.log(47,charCode,'blur');
        
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
    
    $scope.sync( $scope.id );
    
    if ( window.refreshTimeout ) clearTimeout(window.refreshTimeout);
    window.refreshTimeout = setTimeout(function(){
        $scope.sync( $scope.id );
    },10*60*1000)// Every 10 minutes
}])

.controller('SearchController', ['$scope','$rootScope','$location','$route','news', function($scope,$rootScope,$location,$route,news) {

    // List of available feeds:
    news.getFeeds(function(feeds){
        $scope.feeds = feeds;
        try { $scope.$digest(); } catch (e) {}
    });

    $scope.s = $rootScope.s ? $rootScope.s : ( $route.current.params.q ? $route.current.params.q : '' );
    console.log( 860 , $scope.s , $rootScope.s , $route.current.params.q );
    
    $scope.entries = [];
    var $s = angular.element( document.getElementById('s') ).val( $scope.s );
    $scope.search = function() {
        $scope.s = $rootScope.s = $s.val();
        // window.location.hash = '#/search/'+ ( $scope.s ? $scope.s : '' );
        
        console.log( 86 , $scope.s , $rootScope.s , $route.current.params.q );
        
        news
            .search( $scope.s )
            .then(function( entries ){
                console.log( 96 , entries )
                $scope.entries = entries;
                try { $scope.$digest(); } catch (e) {}
            });
    }
    
    $scope.add = function ( feed ) {
        
        feed.title = feed.title.replace(/<[^>]+>/gm, '');
        feed.source = feed.url.replace(/^.*:\/\//,'').replace(/\/.*$/,'');
        var title = feed.url.replace(/^.*:\/\//,'').replace(/\/+/g,'-').replace(/\./g,'-').toLowerCase();
        
        news.addFeed(title,feed);
        
        // $location.path('/' + title );
        setTimeout(function(){
            window.location.hash = '#/'+ title;
        },1000);
    }

    $s.off('keyup').on('keyup',function(event){
        
        if ( $scope.searchTimeout ) clearTimeout( $scope.searchTimeout );
        
        $scope.searchTimeout = setTimeout(function(){
            
            // $location.path('/search/'+$scope.s);
        
            var charCode = event.which || event.keyCode;
            var charStr = String.fromCharCode(charCode);
            
            if (charCode == 27 ) {
                event.target.value = '';
                event.target.blur();
            }
            
            if ( charCode == 27 || charCode == 8 || /[a-z0-9]/i.test(charStr)) {
                $scope.search();
            }
        },500);
    });
    window.onkeypress = function(event){
        if ( document.getElementById('s') ) {
            document.getElementById('s').focus();
        }
    }
    $scope.search();
    $s[0].focus();
}])

.controller('FeedsController', ['$scope','$rootScope','$location','$route','news', function($scope,$rootScope,$location,$route,news) {

    $scope.s = '';
    $scope.feeds = {};
    news.getFeeds(function(feeds){
        $scope.feeds = feeds;
        console.log( $scope.feeds );
        try { $scope.$digest(); } catch (e) {}
    })
    
    $scope.remove = function ( id ) {
        if ( confirm('Remove feed: ' + $scope.feeds[id].title + '?' ) ) {
            delete $scope.feeds[id]
            news.setFeeds( $scope.feeds );
            try { $scope.$digest(); } catch (e) {}
        }
    }

}])

;