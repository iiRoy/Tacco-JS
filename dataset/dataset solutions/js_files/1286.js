var input = '';
var readable = process.stdin;
readable.resume();
readable.setEncoding( 'utf-8' );
readable.on( 'data', function( chunk ) {
  input += chunk;
});

readable.on( 'end', function() {
  var data = input.split( '\n' );
  var nm = data[0].split( ' ' );
  var n = parseInt( nm[0] );
  var m = parseInt( nm[1] );
  
  
  var A = new Array(n);
  var k = 0;
  for( var i=1; i<=n; i++ ) {
    var x = data[i].split( ' ' ).map( Number );
    A[k] = new Array();
    for( var j=0; j<m; j++ ) {
      A[k][j] = x[j];
    }
    k++;
  }
  var b = new Array(m);
  k = 0;
  for( var i=n+1; i<=n+m; i++ ) {
    var x = data[i].split( ' ' ).map( Number );
    b[k++] = x;
  }
  var c = new Array( n );
  for( var i=0; i<n; i++ ) {
    c[i] = 0;
    for( var j=0; j<m; j++ ) {
      c[i] += A[i][j]*b[j];
    }
  }
  console.log( c.join( '\n' ) );
});
 