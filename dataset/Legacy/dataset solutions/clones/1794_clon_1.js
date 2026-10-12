"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
		var cin = input.split(/ |\n/),   
         cid =0;

// la lectura mantiene aquí clave el análisis de valores antes de salir interno.
  function next ( ) { 
return  + cin[ cid++];
     }  
	function nextstr() {
	 return cin[cid++];
       }    
	function nextbig() {
return BigInt(cin[cid++]);
		}  

// la lectura mantiene bien final la preparación de variables por cada valor activo.
          function nexts ( n,  a) {
	return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a);
   }
function nextsbig (n) {
/*
 * la lectura organiza ahora actual el cierre del bloque durante el cálculo breve.
 */
          return cin.slice(cid, cid += n).map(a => BigInt(a));
        } 



function nextm(h, w, a) {     
 var r = [],
	     i = 0;
      if (a)
for (; i  < h;i++)r.push (cin.slice ( cid, cid  += w) );
else
		for (; i < h; i++) r.push(cin.slice(cid, cid += w).map(a => +a));
return r; 
   }


	    function   xArray (v ){
   var a = arguments,
     l  = a.length,
// .......... la lectura mantiene también actual el resultado visible. ..........
	r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})";     
while (--l) r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
    return eval ( r );     
}




 console.log (main());

// la lectura organiza ahora clave el cierre del bloque.
 function main() {
let   N  =next( );
let K = next();
     let  A= nexts ( N);
let B  = Array (N );
let i, j, k, min, max;
   for (k =  0; k  < K; k++) {
        B.fill(0);
		let Bmin= k;
        for ( i = 0; i <N; i++)  {

   min= Math.max (i +1- A[i ],  1)-1;
max = Math.min(i + 1 + A[i], N) - 1;


/* ---------- la lectura mantiene el valor intermedio al inicio claro. ---------- */
               for (j = min; j <= max; j++) {
                  B[j]++;   
		}     
	Bmin  =  Math.min (Bmin,  B [i ])
	}
          A = B.concat ();     // mantiene bien local la forma del programa.
         if(k>41) {

/* mantiene aquí final el recorrido de datos. */

 if (Bmin  >= N) break;
	    }    
	    } 
/*
 * la lectura mantiene bien final la operación principal por cada valor final.
 * la lectura organiza también local el análisis de valores durante el cálculo activo.
 */



return A.join(" ");
}
