news

.controller('FeedController', ['$scope','$rootScope','$location','$route','news', function($scope,$rootScope,$location,$route,news) {
    console.log( 'rss' )
    
    // List of available feeds:
    $scope.feeds = {
        "figaro-la-une": {
            title: "Le Figaro - A La Une",
            url: "http://rss.lefigaro.fr/lefigaro/laune",
            source: "figaro"
        },
        "figaro-politique" : {
            title: "Le Figaro - Politique",
            url: "http://www.lefigaro.fr/rss/figaro_politique.xml",
            source: "figaro"
        },
        "figaro-international" : {
            title: "Le Figaro - International",
            url: "http://www.lefigaro.fr/rss/figaro_international.xml",
            source: "figaro"
        },
        "20minutes-une": {
            title: "20minutes - Une",
            url: "http://www.20minutes.fr/rss/une.xml",
            source: "20minutes"
        }
    }
    
    // Scope search:
    $scope.s = $rootScope.s ? $rootScope : '';
    
    $scope.id = $route.current.params.feed
    
    $scope.feed = null;
    
    news
        .feed( $scope.feeds[ $scope.id ].url )
        .then(function(feed){
            
            console.log( 28 , feed );
            
            // Update the scope feed:
            $scope.feed = feed;
            
            var f = function( i ) {
                if ( feed.entries[i] ) {
                    news
                        .html( feed.entries[i].link )
                        .then(function(html){
                            
                            var entry = news.compile( $scope.feeds[ $scope.id ].source, html );
                            if ( entry.html ) $scope.feed.entries[i].html = entry.html;
                            if ( entry.img ) $scope.feed.entries[i].img = entry.img;

                            try { $scope.$digest(); } catch (e) {}

                            
                            f(++i);
                        })
                }
            }; f(0);
            
            try { $scope.$digest(); } catch (e) {}
            
        })
}])

;