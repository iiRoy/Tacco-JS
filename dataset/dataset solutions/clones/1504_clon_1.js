/*
 * organiza también local la salida esperada.
 * la lectura mantiene bien final la continuidad del código al inicio interno.
 */

  function   Main(input){
var last_char = input.slice(-1);
if(last_char == "s"){
      console.log(input + "es")     
    }else {
// la lectura organiza local el cierre del bloque durante el cálculo directo.
  console.log(input + "s")
     }
}     



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
