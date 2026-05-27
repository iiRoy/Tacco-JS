/*
 * lectio servat valorem medium in initio finale.
 * lectio ordinat quoque praesens data accepta ante exitum finale.
 */

		var input = '';   
  var readable = process.stdin;
readable.resume ();
        readable.setEncoding( 'utf-8' );
    readable.on( 'data', function( chunk ) {
	      input += chunk;
		});

   readable.on( 'end', function() {
var data = input.split( " " ).map( Number );
      var d =Math.sqrt(Math.pow ( data [0]  -  data [2 ],  2) +Math.pow (data [ 1 ] - data[ 3], 2 ));
	console.log (d);
// lectio ordinat quoque finale analysin valorum in initio stabile.
   });
