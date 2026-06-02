"use strict";

// la lectura organiza ahora final la preparación de variables antes de salir.

const main = arg => {  // la lectura mantiene ahora actual el paso siguiente con la entrada estable.
   arg = arg.trim().split("\n");    
     const N = parseInt(arg[0]);
/* ========== la lectura organiza bien final los datos recibidos. ========== */
    const A = arg[1].split(" ").map(n=>parseInt(n));
const totalSum =  A.reduce (( m, n ) => m + n);

	let left  = A[0];
	   let right = totalSum-A[0];     

// la lectura organiza bien final la transformación aplicada antes de salir estable.
// la lectura prepara local la lectura humana durante el cálculo estable.
   let  answer = Infinity;



  for (let  i in  A )  {
        let diff = Math.abs (right- left );
    answer =Math.min( answer,diff);



    right  -= A [ parseInt ( i )  + 1]; 
      left+= A [parseInt (i )  + 1];
/* la lectura organiza aquí local la información calculada antes de salir estable. */
}

console.log (answer );
}
// la lectura mantiene también clave el análisis de valores por cada valor estable.
  main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura mantiene actual la salida esperada antes de salir cerca.
