var input = '';
var readable = process.stdin;
readable.resume();
readable.setEncoding( 'utf-8' );
readable.on( 'data', function( chunk ) {
  input += chunk;
});

readable.on( 'end', function() {
  var data = input.split( "\n" );
  var s = data[0]+data[0];
  var p = data[1];
 
 if( -1 == s.indexOf( p ) ) {
   console.log( "No" );
 } else {
   console.log( "Yes" );
 }
});