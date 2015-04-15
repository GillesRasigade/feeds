news

// Ref:
// - http://www.bennadel.com/blog/2612-using-the-http-service-in-angularjs-to-make-ajax-requests.htm
// - http://viralpatel.net/blogs/angularjs-service-factory-tutorial/
.service('news', ['$http','$q','storage', function( $http, $q, storage ) {
    
    this.feeds = {
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
    
    this.sync = function( callback , $scope , id ) {
        
        var $this = this;
        
        var _feeds = [];
        if ( id ) {
            _feeds.push( this.feeds[id] );
            
        } else {
            for ( var i in this.feeds ) {
                _feeds.push( this.feeds[i] );
            }
        }
        
        if ( $scope ) $scope.syncing = 0;
        
        // Number of feedsto synchronize:
        var nFeeds = _feeds.length;
        
        var g = function() {
            var _feed = _feeds.shift();
            
            if ( false && $scope ) {
                $scope.syncing = ( nFeeds - _feeds.length ) / ( nFeeds * 25 );
                try { $scope.$digest(); } catch (e) {}
            }
            
            if ( _feed ) {
                
                console.log('Syncing feed: ' + _feed.url );
                
                $this
                    .feed( _feed.url )
                    .then(function(feed){
                        
                        if ( $scope && id ) {
                            $scope.feed = feed;
                            try { $scope.$digest(); } catch (e) {}
                        }
                        
                        var f = function( i ) {
                            if ( feed.entries[i] ) {
                                console.log('Syncing: ' + feed.entries[i].link );
                                
                                $this
                                    .html( feed.entries[i].link )
                                    .then(function(html){
                                        
                                        if ( $scope && id ) {
                                            var entry = $this.compile( $this.feeds[ $scope.id ].source, html );
                                            if ( entry.html ) $scope.feed.entries[i].html = entry.html;
                                            if ( entry.img ) $scope.feed.entries[i].img = entry.img;
                                        }
                                        
                                        if ( $scope ) {
                                            $scope.syncing = ( (nFeeds - _feeds.length - 1)*15 + i + 1 ) / ( nFeeds * 15 );
                                            try { $scope.$digest(); } catch (e) {}
                                        }
                                        
                                        f(++i);
                                    })
                            } else {
                                g();
                            }
                        }; f(0);
                    });
            } else {
                if ( 'function' === typeof(callback) ) callback();
            }
        }; g();
    }

    this.getPath = function ( feed ) {
        return '/'+feed.replace(/^https?:\/\//,'');
    }

    // https://developers.google.com/feed/v1/
    // http://stackoverflow.com/questions/10943544/how-to-parse-a-rss-feed-using-javascript
    this.feed = function ( feed , num ) {
        var $this = this;
        num = num ? num : 15;
        
        return new Promise(function(resolve,reject){
            
            var _resolve = function( content ) {
                for ( var i in content.entries ) {
                    if ( content.entries[i].publishedDate ) {
                        content.entries[i].date = new Date( content.entries[i].publishedDate );
                    }
                }
                
                return resolve(content);
            }
            
            storage.get($this.getPath(feed),'feed.json',function(cache,entry){
                
                if ( cache && !navigator.onLine ) {
                    return _resolve(JSON.parse(cache));
                }
                
                return ( $this.request({
                    url: '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num='+num+'&callback=JSON_CALLBACK&q=' + encodeURIComponent(feed),
                    method: "get",
                    headers: {
                        'Content-type': 'application/json'
                    }
                },'jsonp')
                .then(function( data ){
                    
                    var content = data.data.responseData.feed;
                    
                    // Merge current feed content:
                    if ( false && cache ) {
                        content.entries = angular.extend(content.entries, JSON.parse(cache).entries)
                        console.log( 38 , cache , content );
                    }
                    
                    storage.set($this.getPath(feed),'feed.json',JSON.stringify(content));
                    
                    return _resolve(content);
                    
                    // Return feed data:
                    return content;
                })
                );
            })
        });
    }
    
    this.html = function ( url ) {
        var $this = this;
        
        return new Promise(function(resolve,reject){
            storage.get($this.getPath(url),'index.html',function(content,entry){
                
                if ( content ) {
                    return resolve(content);
                }
                
                return ( $this.request({
                    // url: 'http://whateverorigin.org/get?callback=JSON_CALLBACK&url=' + encodeURIComponent(url),
                    url: '//cors-anywhere.herokuapp.com/' + url,
                    method: "get"
                },'html')
                .then(function( data ){
                    
                    var html = data.data;
                    
                    // Remove unnecessary data:
                    // html = html.replace(/<script(?!<\/script)<\/script>/,'');
                    
                    storage.set($this.getPath(url),'index.html',html);
                    
                    // Return feed data:
                    return resolve(html);
                })
                );
            })
        });
    }
    
    var compilers = {
        _pre: function ( html ) {
            var parser = new DOMParser();
            var $html = parser.parseFromString(html, 'text/html');
            return $html;
        },
        figaro: function ( html ) {
            var $html = compilers._pre(html);
            var output = { html: '', img: null };
            
            // Extract the body content:
            var $div = $html.querySelectorAll( '.fig-article-body' );
            if ( $div.length ) {
                output.html = $div[0].innerHTML;
            }
            
            // Extract the article photo:
            var $img = $html.querySelectorAll( '.fig-photo img' );
            if ( $img.length ) {
                output.img = $img[0].src;
            }
            
            return output
        },
        "20minutes": function ( html ) {
            var $html = compilers._pre(html);
            var output = { html: '', img: null };
            
            angular.forEach( $html.querySelectorAll('#page-content .author-sign'),function(o,i){ o.remove(); });
            angular.forEach( $html.querySelectorAll('#page-content .content-related.index'),function(o,i){ o.remove(); });
            angular.forEach( $html.querySelectorAll('#page-content .content-related.buzz'),function(o,i){ o.remove(); });
            
            // Extract the article photo:
            var $img = $html.querySelectorAll( '#page-content figure img' );
            if ( $img.length ) {
                output.img = $img[0].src;
            }
            
            // Extract the body content:
            var $div = $html.querySelectorAll( '#page-content div[role="main"]' );
            if ( $div.length ) {
                $div[0].querySelectorAll('#page-content figure img')[0].remove();
                output.html = $div[0].innerHTML;
            }
            
            return output
        }
    }
    
    this.compile = function ( source , html ) {
        if ( compilers[source] ) {
            return compilers[source](html);
        } else {
            return { content: '' , img: null }
        }
    }
    
    this.request = function ( config , type ) {
    
        // Parameter initialization:
        config = config ? config : {};
        config.params = config.params ? config.params : {};
        
        // Perform the request:
        var request = null;
        switch ( type ) {
            case 'jsonp':
                request = $http.jsonp(config.url,config);
                break;
            default:
                request = $http(config);
                break;
        }

        // Returing the callbacks:
        return( request.then(
            
            function(response){             // SUCCESS
            
            // Return the
            return( response );
            
        }, function(response,status){              // ERROR
            
            // The API response from the server should be returned in a
            // nomralized format. However, if the request was not handled by the
            // server (or what not handles properly - ex. server error), then we
            // may have to normalize it on our end, as best we can.
            if (
                ! angular.isObject( response.data ) ||
                ! response.data.message
                ) {

                return( $q.reject( "An unknown error occurred." ) );

            }

            // Otherwise, use expected error message.
            return( $q.reject( response.data.message ) );

            
        }) );

    }
    
}])

.service('storage', function() {
    this.fs = null;
                    
    this.set = function ( path , filename , content , callback , params ) {
        if ( $this.fs ) {
    
            // Recursively create the hierarchical structure:
            cmd.cd( path , function( dir ){
                //console.log( dir );
                
                setTimeout(function(){
                    dir.getFile( filename, {create: true}, function(fileEntry) {
                        
                        // Create a FileWriter object for our FileEntry (log.txt).
                        fileEntry.createWriter(function(fileWriter) {

                            fileWriter.onwriteend = callback;
                            fileWriter.onerror = params ? params.error : $this.error;

                            // Create a new Blob and write it to log.txt.
                            var blob = new Blob([content], {type: params && params.type ? params.type : 'text/plain'});

                            fileWriter.write(blob);

                        }, $this.error);
                    });
                },500);
                
            });
        }
    }
    this.get = function ( path , filename , callback ) {
                
        if ( $this.fs ) {
        
            // Recursively create the hierarchical structure:
            cmd.cd( path , function( dir ){
                //console.log( dir );
                
                setTimeout(function(){
                    dir.getFile( filename, {create: true}, function(fileEntry) {
                        
                        fileEntry.file(function(file) {
                            var reader = new FileReader();

                            reader.onloadend = function(e) {
                                if ( typeof(callback) == 'function' ) callback( this.result , fileEntry );
                            };

                            reader.readAsText(file);
                        }, $this.error);
                    });
                },25);
            });
        } else if ( typeof(callback) == 'function' ) callback('');
    }
    this.remove = function ( path , filename , callback ) {
                
        if ( $this.fs ) {
        
            // Recursively create the hierarchical structure:
            cmd.cd( path , function( dir ){
                console.log( dir );
                
                setTimeout(function(){
                    if ( undefined === filename ) {
                        
                        dir.remove(function() {
                            if ( typeof(callback) == 'function' ) callback();
                        }, $this.error);
                    
                    } else {
                
                        dir.getFile( filename, {create: true}, function(fileEntry) {
                            
                            fileEntry.remove(function() {
                                if ( typeof(callback) == 'function' ) callback();
                            }, $this.error);
                        });
                        
                    }
                },25);
            });
        } else if ( typeof(callback) == 'function' ) callback();
        
    }
    this.clear = function ( callback ) {
        if ( $this.fs ) {
        
            // Recursively create the hierarchical structure:
            cmd.cd( $this.fs.root , function( dir ){
                console.log( dir );
                
                setTimeout(function(){
                    
                    dir.removeRecursively(function() {
                        if ( typeof(callback) == 'function' ) callback();
                    }, $this.error);
                    
                },25);
            });
        }
    }
    
    var cmd = {
        // REF: http://www.html5rocks.com/en/tutorials/file/filesystem/?redirect_from_locale=fr#toc-dir-subirs
        mkdir: function ( folders , callback , rootDirEntry ) {
            rootDirEntry = rootDirEntry !== undefined ? rootDirEntry : $this.fs.root;
            if ( typeof(folders) == 'string' ) folders = folders.split('/');
        
            // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
            if (folders[0] == '.' || folders[0] == '') {
                folders = folders.slice(1);
            }
            rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
                // Recursively add the new subfolder (if we still have another to create).
                if (folders.length) {
                    cmd.mkdir(folders.slice(1),callback,dirEntry);
                } else {
                    if ( typeof(callback) == 'function' ) callback( dirEntry );
                }
            }, $this.error);
        },
        pwd: function ( path ) {
            
        },
        ls: function ( path ) {
            
        },
        cd: function ( path , callback , rootDirEntry ) {
            cmd.mkdir( path , callback , rootDirEntry );
        }
    }
    
    this.check = function ( callback ) {
        
        if ( null !== this.fs ) {
            if ( 'function' === callback ) return callback();
            else return true;
        }
        
        return false;
    }
    
    this.init = function(fs){
        $this.fs = fs;
        console.log('Opened file system: ' + fs.name , this.fs );
    }
    this.error = function(){
        var msg = '';

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
              msg = 'QUOTA_EXCEEDED_ERR';
              break;
            case FileError.NOT_FOUND_ERR:
              msg = 'NOT_FOUND_ERR';
              break;
            case FileError.SECURITY_ERR:
              msg = 'SECURITY_ERR';
              break;
            case FileError.INVALID_MODIFICATION_ERR:
              msg = 'INVALID_MODIFICATION_ERR';
              break;
            case FileError.INVALID_STATE_ERR:
              msg = 'INVALID_STATE_ERR';
              break;
            default:
              msg = 'Unknown Error';
              break;
        };
        
        console.error('Error: ' + msg);
    }
    
    // You can not attach a native function to a JS object.
    // REF: http://stackoverflow.com/questions/9677985/uncaught-typeerror-illegal-invocation-in-chrome
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, this.init, this.error);
    var $this = this;
})

.factory("settings",function(){
        return {};
});