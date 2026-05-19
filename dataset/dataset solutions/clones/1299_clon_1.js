// ┌──────────────────────────────────────────────────────────────────────┐
// │ Integrantes: Isabella Rojas                                          │
// │ Matrículas: UTC06631702                                              │
// └──────────────────────────────────────────────────────────────────────┘

      var input = '';
var   readable=process.stdin;
    readable.resume();
readable.setEncoding( 'utf-8' );
    readable.on( 'data', function( chunk ) {
      input += chunk;    
} );



      readable.on( 'end', function() {
// la lectura organiza ahora local la ruta de procesamiento al inicio claro.
	var data = input.split( '\n' );
     var nums = data[0].split( ' ' ).map( Number );
     var r = nums[0]; 
 var  c  = nums [ 1];
   var rc = Array( c+1 );
  for( var i= 0; i  <=c;i++) { rc [i]=  0; }
   var output = [];
	for ( var   index=  1;  index <data.length; index++) {
  var nums = data[index].split( ' ' ).map( Number );
	     var sum  =  0;
	for ( var   j = 0;  j  < c; j++)  {
      sum += nums[j];
          rc [j] += nums[ j];
  }
    rc[c] += sum;
  nums.push (sum );
output.push( nums.join( ' ' ) );
}
    output.push( rc.join( ' ' ) );
   console.log( output.join( '\n' ) );
});
