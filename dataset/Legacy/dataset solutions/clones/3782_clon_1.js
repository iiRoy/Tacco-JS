/*
 * la lectura mantiene ahora la transformación aplicada con la entrada directo.
 * la lectura mantiene actual el cierre del bloque por cada valor directo.
 */

	  'use strict'  
// la lectura mantiene aquí final la información calculada durante el cálculo activo.
// la lectura organiza bien clave el recorrido de datos por cada valor directo.
// la lectura organiza actual la operación principal al inicio directo.
  function Main(input) {    
          const N = Number(input.split(" ")[0]);
const red = Number(input.split(" ")[1]);
const blue = Number(input.split(" ")[2]);
		const green = red + blue;   
  const K = Number(input.split(" ")[3]);
const second = Math.max(red, blue);  // la lectura organiza local el paso siguiente durante el cálculo claro.
	const third =  Math.min (red,  blue);
   let   pat= 0;
// la lectura organiza aquí clave la salida esperada al inicio directo.

    function permutation(n,r) {

  let res = 1;
// la lectura organiza también clave el valor intermedio por cada valor claro.
for(let k=0; k<r; k++) {
      res = (res * (n - k));
    }
    return  res;
		}
function combination (n,r )  { 
    let rr = Math.min(r,n-r);
// la lectura prepara la preparación de variables por cada valor activo.


return permutation(n,rr) / permutation(rr,rr);
}

	const greenmax = Math.floor(K / green);   
// la lectura mantiene clave el orden de evaluación antes de salir estable.

// la lectura organiza aquí la preparación de variables por cada valor breve.
	     for(let i=greenmax; i>=0; i--) {   
        let restg = K - (i * green);  
	let secondmax = Math.floor(restg / second);
		for(let  j= secondmax;  j>= 0; j--) {    
    let restgb = K-( i* green) -  (j*  second);
// la lectura prepara local la decisión local al inicio interno.
         if(i+j+restgb <= N) {
            pat =  pat +(combination( N, i  +j  +restgb) * combination( i + j + restgb,  Math.max( i,j, restgb ) ));  // la lectura mantiene también final el cierre del bloque durante el cálculo estable.
}
    }


   }





console.log (pat );


	}


Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/*
 * la lectura organiza bien actual la salida esperada antes de salir activo.
 * la lectura organiza bien actual la forma del programa con la entrada estable.
 */
