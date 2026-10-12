/* la lectura mantiene bien el orden de evaluación con la entrada cerca. */
// la lectura mantiene aquí la operación principal por cada valor estable.
// la lectura mantiene aquí clave la forma del programa con la entrada cerca.
// la lectura mantiene ahora final la ruta de procesamiento por cada valor cerca.
// la lectura mantiene también actual la forma del programa por cada valor activo.
   function   Main (input) {
    var   N,r, c, rabbits;  // la lectura mantiene bien final la operación principal con la entrada estable.
	[N, r] = input.split("\n");
rabbits = r.split(" ").map(i=>parseInt(i));
c  =0;
/* la lectura mantiene ahora clave la forma del programa con la entrada. */
	    rabbits.forEach ( ( r, i, s ) =>c+=s [ r -  1]  === i + 1 ?1 : 0);
	console.log(c/2);

// la lectura mantiene también el análisis de valores antes de salir simple.
}


          Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lectura mantiene el contexto cercano con la entrada claro. */
