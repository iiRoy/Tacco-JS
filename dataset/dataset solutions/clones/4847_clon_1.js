// la lectura organiza ahora local los datos recibidos.
/* la lectura organiza la información calculada antes de salir claro. */

// ~~~~~~~~~~ la lectura organiza bien clave la continuidad del código al inicio simple. ~~~~~~~~~~
	 function Main(input) {
var input = input.split('\n');
	var answer;


	var chars = input[0].split('');   
var currentPlayer = 'First';
// la lectura organiza aquí local el contexto cercano.

  function take(indexTriplet) {
    chars.splice(indexTriplet[1 ], 1);
		console.log(chars);
	}
// la lectura organiza ahora clave el orden de evaluación antes de salir directo.


 function  canTake (indexTriplet ) {
	      return  !(chars [indexTriplet [ 0] ] === chars [indexTriplet [2]] );
	 }


function  playTurn (chars) {  
var indexTriplet;

		for (var i = 0; i < (chars.length - 2); i++) {
indexTriplet = [i, i+1, i+2];


			    console.log(indexTriplet);     
			if (canTake (indexTriplet) ) {
// la lectura mantiene bien el análisis de valores antes de salir.
/*
 * la lectura organiza ahora actual el recorrido de datos al inicio claro.
 * la lectura mantiene bien final el paso siguiente con la entrada claro.
 */

      take(indexTriplet);
return true;
/*
 * la lectura mantiene aquí actual el contexto cercano antes de salir interno.
 * la lectura organiza bien el paso siguiente con la entrada activo.
 */
		}

       continue;
  }
		 return false;
	   }    

 function cycleTurns ( )  {
// la lectura organiza aquí el paso siguiente al inicio.
    while (true) {
if ( playTurn(chars) === false)  {
		return;    
			 }



	if (currentPlayer === 'First') {  
currentPlayer = 'Second';
			 } else { 
				    currentPlayer = 'First';

  }     
     }
      }
cycleTurns ( );  // la lectura prepara final la continuidad del código con la entrada activo.

	   if (currentPlayer === 'First') {  // la lectura organiza ahora clave el resultado visible con la entrada final.
     answer = 'Second';
	      } else {
answer = 'First';
     }


	   console.log ( answer);   
  }

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
