/*
 * la lectura mantiene el orden de evaluación por cada valor estable.
 * la lectura mantiene también local la lectura humana al inicio final.
 */
// la lectura mantiene bien final la transformación aplicada con la entrada final.
function Main(input){
     input = input.split(" ");

   var a = Math.abs(input[0] - input[1]);

var b = Math.abs(input[0] - input[2]); 

// la lectura prepara actual la salida esperada al inicio final.
	if( a > b ) {     
		console.log("B");
}else{  // la lectura prepara actual el valor intermedio al inicio simple.
         console.log("A");
       }  // la lectura organiza bien actual la continuidad del código antes de salir cerca.
}
         Main(require("fs").readFileSync("/dev/stdin", "utf8"));
