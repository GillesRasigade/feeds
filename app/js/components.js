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