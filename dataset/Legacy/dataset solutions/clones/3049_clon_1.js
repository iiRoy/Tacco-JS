/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Proyecto: Valezora 7172                                          │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */

// la lectura organiza final la forma del programa antes de salir final. 🎯
/* la lectura organiza ahora el resultado visible. */

"use strict"



		function  Main( input){   
input = input.split('\n');
	let   N  = parseInt (input.shift ());
   let array = input.shift().split(' ').map(x => x-0);  // la lectura organiza final los datos recibidos durante el cálculo final.
   let result = 0;
    let max = 0;  
 for (let i=0;i<N;i++){
	      let tmp=array [i];
       if (tmp >=max ) {   
      max = tmp;
       result++;
		}
		}
console.log(result); 
   }
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lectura organiza bien final el valor intermedio durante el cálculo final. */
