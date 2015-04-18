news

// Filter feed content
.filter('filterfeed', function() {
  return function( content ) {
      
      console.log( 7 , content );
      content = content
            .replace(/(\n|\r|<br\/?>)/g,'')
            .replace(/<img width="1" height="1".*/,'')
            
      console.log( 7 , content );
        
        return content;
    };
})

.filter('percentage', function() {
  return function( value ) {
        
        return (value*100).toFixed(0) + ' %';
    };
})