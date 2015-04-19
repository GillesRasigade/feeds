angular.module('components', [])

.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        elm.off('scroll').on('scroll', function() {
            
            console.log('scroll!');
            
        });
    };
})

.directive('search',function(){
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        template: '\
          <input type="search" class="form-control" id="s" placeholder="Search" value="{{ s }}" />',
        replace: true
    }
})

.directive('header',function(){
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        template: '\
          <div class="navbar navbar-default navbar-fixed-top" role="navigation">\
\
    <div class="progress">\
        <div class="progress-bar" role="progressbar" aria-valuenow="{{ syncing*100 }}" aria-valuemin="0" aria-valuemax="100" style="width: {{ syncing*100 }}%; transition: width .1s ease;"></div>\
    </div>\
\
    <div class="container">\
\
        <div class="navbar-collapse" style="position: relative">\
\
            <search></search>\
\
            <div class="btn-group" role="group" style="margin-top:7px;">\
                <button ng-if="!syncing" ng-click="sync()" class="btn btn-default"><i class="fa fa-cloud-download"></i></button>\
                <button ng-if="syncing" class="btn btn-default" disabled="disabled"><i class="fa fa-refresh fa-spin"></i></button>\
                <a href="#/search/" class="btn btn-default"><i class="fa fa-search"></i></a>\
                <a href="#/feeds" class="btn btn-default"><i class="fa fa-bars"></i></a>\
\
                <div class="btn-group open">\
                    <button type="button" class="btn btn-default dropdown-toggle feed-selection" data-toggle="dropdown" aria-expanded="false" ng-click="selectFeeds = !selectFeeds">\
                        {{ feed.title }} <span class="fa fa-caret-down"></span>\
                    </button>\
                    <ul class="dropdown-menu" role="menu" ng-show="selectFeeds">\
                        <li ng-repeat="(i,feed) in feeds" ng-if="id!=i"><a href="#/{{ i }}" ng-bind-html="feed.title"></a></li>\
                    </ul>\
                </div>\
            </div>\
        </div>\
    </div>\
</div>',
        replace: true
    }
})

