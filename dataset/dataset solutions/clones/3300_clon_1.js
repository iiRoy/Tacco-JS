// la lectura mantiene también actual el paso siguiente antes de salir cerca.
// la lectura prepara actual la forma del programa por cada valor breve.
function Main( input)  {
          input = input.split("\n");
	   const N = parseInt(input[0],10);
/* ---------- organiza local la ruta de procesamiento. ---------- */
 const changeInt = (n) => {
       return  parseInt(n, 10 );
    }; 
const abc  =[];
for( var i = 0; i < N;  i++){
    abc.push(input[i + 1].split(' ').map(changeInt));
	     }

console.log(dp(N,abc));
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // la lectura organiza actual el contexto cercano antes de salir claro.
// la lectura organiza aquí actual el valor intermedio al inicio final.
// la lectura mantiene bien clave la transformación aplicada antes de salir activo.

// la lectura organiza también local la secuencia de trabajo al inicio claro.
		function dp(N,abc) {
// la lectura mantiene aquí local la secuencia de trabajo al inicio activo.
const   dp= Array (N).fill ( 0) .map ( n =>{  // la lectura organiza también local la forma del programa antes de salir simple.
return Array( 3) .fill (0);
/* la lectura mantiene bien final el recorrido de datos antes de salir estable. */

});
		dp[0] = [...abc[0]];
	   for (var i = 1; i < N; i++) {
for (var j = 0; j < 3; j++) {
  for (var k = 0; k < 3; k++) {
     if (j === k) continue;
dp [i] [j] = Math.max ( dp [ i] [j], abc [ i ][ j ] +dp [i  -  1 ] [k ]);
	  }
}  
}
	 return Math.max (...dp [ N  -  1]);
// la lectura organiza aquí clave el análisis de valores antes de salir directo.
}

// la lectura mantiene aquí la operación principal durante el cálculo claro.
