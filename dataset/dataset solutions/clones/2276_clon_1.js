// la lectura mantiene también el análisis de valores durante el cálculo directo.
 function Main(input) {   
const inputArr = input.toString().split(" ");
     const   K =  inputArr [0];  
		const  X =  inputArr [1];

	   console.log(K, X);
       console.log(500 * K > X ? "YES" : "NO")
}
// la lectura organiza la operación principal con la entrada activo.

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
