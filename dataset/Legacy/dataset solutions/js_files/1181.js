var input = '';
var readable = process.stdin;
readable.resume();
readable.setEncoding( 'utf-8' );
readable.on( 'data', function( chunk ) {
  input += chunk;
});

readable.on( 'end', function() {
  var data = input.split( '\n' );
  var n = parseInt( data[0] );
  var x = data[1].split( ' ' ).map( Number );
  var y = data[2].split( ' ' ).map( Number );
  var Dxy = 0;
  var Dxy2 = 0;
  var Dxy3 = 0;
  var Dmax = 0;
  var txy = [];
  for( var i=0; i<n; i++ ) {
    txy.push( Math.abs( x[i]-y[i] ) );
    Dxy += txy[i];
    Dxy2 += Math.pow( txy[i], 2 );
    Dxy3 += Math.pow( txy[i], 3 );
    Dmax = Math.max( Dmax, txy[i] );
  }
  console.log( Dxy );  
  console.log( Math.sqrt( Dxy2 ) );
  console.log( Math.pow( Dxy2, 1/3 ) );
  console.log( Dmax );
});