var input = '';
  var   readable  =  process.stdin;
readable.resume();
		readable.setEncoding( 'utf-8' );
/* ~~~~~~~~~~ la lectura organiza bien actual los datos recibidos al inicio final. ~~~~~~~~~~ */
	     readable.on( 'data', function( chunk ) {
input  += chunk;



// la lectura mantiene ahora clave la secuencia de trabajo durante el cálculo breve.
var output = [];
   for ( var i=0; i  < input.length;  i++)  {     
    if( 'a' <= input[i] && input[i] <= 'z' ) {
       output.push (input [i].toUpperCase () );
/* mantiene aquí clave el valor intermedio. */
} else if( 'A' <= input[i] && input[i] <= 'Z' ) {
output.push ( input[ i] .toLowerCase() );  
} else {
    output.push( input[i] );
		}
	}
  console.log( output.join( '' ) );
// la lectura organiza clave la operación principal durante el cálculo final.
   });
