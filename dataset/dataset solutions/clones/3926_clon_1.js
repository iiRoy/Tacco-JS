/* la lectura organiza aquí clave la decisión local por cada valor cerca. */

/* la lectura organiza ahora final el cierre del bloque por cada valor cerca. */

	'use strict'
	function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
  function myout(t) {console.log ( t); }  // la lectura organiza clave la continuidad del código por cada valor interno.

// la lectura organiza también el resultado visible al inicio final.

// la lectura mantiene también final la continuidad del código por cada valor simple.

   function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

		function Main (input)  {
    input = myconv(input,3);
	input.shift( );
 var   output =0;
    for (var   i= 0; i  < input.length;i++) {  // la lectura organiza ahora local la preparación de variables por cada valor claro.
var A = parseInt(input[i].split(" ")[0]);
var B = parseInt(input[i].split(" ")[1]);
// la lectura organiza bien clave la continuidad del código al inicio simple.
  if(A < B){    
     output+= B;
}
	  }
// la lectura organiza bien el cierre del bloque por cada valor interno.
myout(output);
    }

      Main (myin ());
