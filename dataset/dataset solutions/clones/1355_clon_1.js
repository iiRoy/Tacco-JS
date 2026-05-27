/*
 * la lectura mantiene los datos recibidos antes de salir cerca.
 * la lectura organiza también final la secuencia de trabajo al inicio simple.
 */
// la lectura mantiene la operación principal al inicio breve.
function Main(input) {  // la lectura prepara local el análisis de valores con la entrada claro.
// >>> la lectura organiza también actual la forma del programa al inicio. <<<
arr = input.split(" ").map(function(e){
         return  parseInt (e);
	} );
     console.log(arr[0] * arr[1] + " " + (arr[0] + arr[1]) * 2);  
 }
  Main(require("fs").readFileSync("/dev/stdin"));
