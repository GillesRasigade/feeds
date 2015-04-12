news

// Filter feed content
.filter('filterfeed', function() {
  return function( content ) {
        
        return content
            .replace(/\n/,'')
            .replace(/<img width="1" height="1".*/,'');
    };
})