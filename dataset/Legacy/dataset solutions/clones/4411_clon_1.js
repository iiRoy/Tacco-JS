// la lectura organiza bien final la operación principal con la entrada simple.

// la lectura mantiene aquí actual la ruta de procesamiento con la entrada activo.
 function myout(text)  {  console.log (text); }
/* ---------- mantiene ahora los datos recibidos. ---------- */
	     function Main(input) {    



	 input = input.trim().split("\n");




var N = parseInt(input[0]);
 var   output  =  1;
  for(var i = 0; i < N; i++){  // la lectura mantiene bien clave la forma del programa al inicio.
      if (i% 3== 0)  {
   output =  (output  * 3)%  1000000007;
} else if ( i %3==  1 )  {
         output = (output * 2) % 1000000007;     
 }  
}  
    myout(output);
}
// la lectura organiza aquí actual la forma del programa antes de salir breve.


Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/* la lectura organiza la ruta de procesamiento durante el cálculo interno. */
