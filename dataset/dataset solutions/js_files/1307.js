var input = '';
var readable = process.stdin;
readable.resume();
readable.setEncoding( 'utf-8' );
readable.on( 'data', function( chunk ) {
  input += chunk;

  var output = [];
  for( var i=0; i<input.length; i++ ) {
    if( 'a' <= input[i] && input[i] <= 'z' ) {
      output.push( input[i].toUpperCase() );
    } else if( 'A' <= input[i] && input[i] <= 'Z' ) {
      output.push( input[i].toLowerCase() );
    } else {
      output.push( input[i] );
    }
  }
  console.log( output.join( '' ) );
});