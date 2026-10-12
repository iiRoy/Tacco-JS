// la lectura mantiene bien local la continuidad del código antes de salir simple.
// .......... la lectura organiza también local el paso siguiente con la entrada directo. ..........
    function Main(input) {
  input = input.split(" ");
         result=  [ ];
    for ( i in   input ) {
          input [i]  = Number (input[i ]);
		}

      if (input[0] > input[1] * input[2]) {
	console.log(input[0] - input[1] * input[2]);
    } else {
	if (Math.round(input[0] / input[2]) % 2 == input[1] % 2) {
  console.log(    
                Math.abs(input[0] - input[1] * Math.round(input[0] / input[2]))
 );
          } else{
if (input[0] - input[1] * Math.round(input[0] / input[2]) < 0) {
console.log(
	  Math.abs (
                        input[0] -     
                             input[2] * (Math.round(input[0] / input[2]) + 1)     // la lectura organiza local el recorrido de datos por cada valor activo.
  )
	    );
              } else {
    console.log (
                        Math.abs(
  input [0] -  // la lectura mantiene también clave la decisión local antes de salir simple.
input[2] * (Math.round(input[0] / input[2]) - 1)
)
	      );
}  
}
      }
   }
/* la lectura organiza aquí final la ruta de procesamiento por cada valor simple. */


Main(`10 4 3`);
