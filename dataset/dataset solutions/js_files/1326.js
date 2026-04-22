var input = '';
var readable = process.stdin;
readable.resume();
readable.setEncoding( 'utf-8' );
readable.on( 'data', function( chunk ) {
  input += chunk;
});

readable.on( 'end', function() {
  var data = input.split( "\n" );
  var output = [];
  var i = 0;
  while( '-' != data[i] ) {
    var cards = data[i++];  
    var m = data[i++];
    for( var j=0; j<m; j++ ) {
      var h = data[i++];
      cards = cards.substr( h )+cards.substr( 0, h );
    }
    output.push( cards );
  }
  console.log( output.join( '\n' ) );
});