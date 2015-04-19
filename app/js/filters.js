news

// Filter feed content
.filter('filterfeed', function() {
  return function( content ) {
      
      content = content
            .replace(/(\n|\r|<br\/?>)/g,'')
            .replace(/<img width="1" height="1".*/,'');
        return content;
    };
})

.filter('feedSource', function(){
    return function ( content ) {
        return content
            .replace(/^https?:\/\//,'')
            .replace(/\/.*$/,'');
    }
})

.filter('percentage', function() {
  return function( value ) {
        
        return (value*100).toFixed(0) + ' %';
    };
})