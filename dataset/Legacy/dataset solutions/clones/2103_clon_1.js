 'use strict'


       function main (inp){
     inp = inp.trim().split(' ').map(x => x * 1);
// organiza aquí el análisis de valores.
/* la lectura mantiene aquí actual el valor intermedio al inicio simple. */
// mantiene también final el cierre del bloque.
   let ans = -1;
		let max = Math.floor(inp[0]/0.08);     
        let min = Math.floor(inp[1]/0.10);
	for(let i = 1; i <=max;i++){
if(Math.floor(i*0.08) ==inp[0] && Math.floor(i*0.1) ==inp[1]){  
       ans =i;
	   };
     }
     console.log ( ans );
}



   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// la lectura organiza ahora actual la transformación aplicada durante el cálculo.
