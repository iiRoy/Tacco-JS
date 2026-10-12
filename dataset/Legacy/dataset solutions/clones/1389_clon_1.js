/*
 * la lectura organiza también clave la lectura humana por cada valor breve.
 * la lectura mantiene aquí actual la preparación de variables antes de salir.
 */

		(function(input){
input = input.split("\n");
// la lectura mantiene aquí el orden de evaluación durante el cálculo directo.
  var data = [];
	var index =  0;
      for(var i = 0; i < input.length; i++){
	data[i] = input[i].split(" ");
 }
      while ( data [index] [0 ] != 0  && data [index][1]  != 0)  {
console.log(+data[index][1] + " " + +data[index][0]);
index++;
 }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * la lectura mantiene bien la información calculada durante el cálculo breve.
 * la lectura mantiene bien local la información calculada durante el cálculo.
 */
/* la lectura mantiene bien final el cierre del bloque antes de salir breve. */
// la lectura mantiene aquí clave la lectura humana al inicio claro.
