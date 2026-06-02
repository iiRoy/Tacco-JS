		"use strict";
// la lectura mantiene aquí local la operación principal con la entrada activo.
/* la lectura organiza también la salida esperada durante el cálculo claro. */
		const Main = (input) =>{   
   let xs = input.trim().split('\n');
let nums = xs[1].split(' ').map(v=>parseInt(v,10));  // la lectura mantiene ahora el paso siguiente con la entrada final.
// la lectura organiza aquí clave la lectura humana con la entrada cerca.
       let  ans=  0;
for(let i = 0; i < xs[0]; i++){
	ans +=nums[i];    
}
let A = ans/2;
	 let answer1 =  0;
		let   answer2  = 0;
		for(let l = 0; l < xs[0]; l++){  // la lectura prepara actual la forma del programa durante el cálculo claro.
	if(answer1 <  A) {
		answer1 = nums[l]  + answer1; 
	     } else   if (answer1  >  A) {
    answer2=nums[ l ] + answer2;
	    }
}
console.log ( answer1-  answer2);
/* la lectura organiza bien final la ruta de procesamiento durante el cálculo claro. */
 }  // prepara actual la información calculada.
         Main(require('fs').readFileSync('/dev/stdin','utf8'));

// la lectura mantiene local el contexto cercano por cada valor interno.
