var input = '';
var readable = process.stdin;
readable.resume();
readable.setEncoding( 'utf-8' );
readable.on( 'data', function( chunk ) {
  input += chunk;
});

readable.on( 'end', function() {
  var output = [];
  var data = input.split( '\n' );
  for( var i=0; i<data.length; i+=2 ) {
    var n = parseInt( data[i] );
    if( 0 == n ) { break; }
    
    var s = data[ i+1 ].split( " " ).map( Number );
    var sum = 0;
    for( var j=0; j<n; j++ ) {
      sum += s[j];
    }
    var ave = sum/n;
    sum = 0;
    for( var j=0; j<n; j++ ) {
      sum += Math.pow( s[j]-ave, 2 );
    }
    output.push( Math.sqrt( sum/n ) );
  }
    
  console.log( output.join( '\n' ) );
});