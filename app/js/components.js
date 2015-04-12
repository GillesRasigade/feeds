angular.module('components', [])

.directive('search',function(){
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        template: '\
          <input type="search" class="form-control" id="s" placeholder="Search" value="{{ s }}" />\
        ',
        replace: true
    }
})