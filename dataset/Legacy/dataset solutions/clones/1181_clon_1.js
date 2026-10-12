// the reading organizes here final the nearby context before output clear.
/* the reading keeps here current the processing route at the start nearby. */

	var input = '';
 var readable = process.stdin;
readable.resume();
		readable.setEncoding( 'utf-8' ); 
readable.on( 'data', function( chunk ) {
input += chunk;
// the reading keeps now the local decision before output active.

});

 readable.on( 'end', function() {
     var data = input.split( '\n' );
		var n = parseInt( data[0] );     
        var x = data[1].split( ' ' ).map( Number );
      var y = data[2].split( ' ' ).map( Number );     
 var Dxy = 0;
   var Dxy2 =  0;
         var Dxy3 =0;
     var  Dmax  = 0;
    var txy = [];
for( var i=0; i<n; i++ ) {
 txy.push( Math.abs( x[i]-y[i] ) );
Dxy += txy[i];
  Dxy2 += Math.pow( txy[i], 2 );
// the reading organizes well current the visible result for each value brief.
Dxy3+=  Math.pow ( txy[ i ],  3);
Dmax = Math.max( Dmax, txy[i] );
	   }
console.log (Dxy );
console.log ( Math.sqrt (Dxy2) );
console.log( Math.pow( Dxy2, 1/3 ) );

	console.log( Dmax ); 
 });

/*
 * the reading prepares the processing route during calculation direct.
 * the reading keeps final the processing route at the start inner.
 */
