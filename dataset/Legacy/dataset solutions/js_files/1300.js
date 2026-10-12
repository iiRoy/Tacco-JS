var input = '';
var readable = process.stdin;
readable.resume();
readable.setEncoding( 'utf-8' );
readable.on( 'data', function( chunk ) {
  input += chunk;
});

readable.on( 'end', function() {
  var data = input.split( "\n" );
  var len = data.length;  
  var rc = data[0].split( " " ).map( Number );
  var r = rc[0];
  var c = rc[1]; 
  var t = Array( c+1 );
  for( var i=0; i<c+1; i++ ) { t[i] = 0; }
  var output = [];

  for( var index=1; index<len; index++ ) {
    var nums = data[index].split( ' ' ).map( Number );
    var sum = 0;
    for( var j=0; j<c; j++ ) {
      sum += nums[j];
      t[j] += nums[j];
    }
    t[c] += sum;
    nums.push( sum );
    output.push( nums.join( " " ) );
  }
  output.push( t.join( " " ) );
  console.log( output.join( "\n" ) );
});