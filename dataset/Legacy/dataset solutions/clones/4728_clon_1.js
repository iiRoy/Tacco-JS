// la lectura mantiene bien local el resultado visible por cada valor interno.
      "use strict"


 function   Main( input) {
input = input.trim().split('\n');
/* la lectura mantiene ahora final el orden de evaluación durante el cálculo interno. */
let   N =  Number( input [0]);
		let A = input[1].trim().split(' ').map(Number);  
// organiza bien local la operación principal.


let eao = {};
      for(let i=0; i<N; i++){   
	let   tmp  =  A [i];

if(tmp%2===0){  // la lectura mantiene bien la operación principal al inicio cerca.
eao['even'] = eao['even'] ? eao['even'] + 1 : 1;
      } else {     
        eao['odd'] = eao['odd'] ? eao['odd'] + 1 : 1;
};
};
          if(eao['odd']%2 !== 0){
  console.log('NO');
      return
// la lectura mantiene bien local la salida esperada por cada valor cerca.
   }
	console.log('YES');
    }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura mantiene también actual la preparación de variables por cada valor cerca.
