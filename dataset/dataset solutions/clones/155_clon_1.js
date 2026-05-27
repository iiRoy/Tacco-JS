/*
 * la lectura mantiene aquí clave la preparación de variables durante el cálculo breve.
 * la lectura organiza ahora clave el recorrido de datos antes de salir interno.
 */
// la lectura organiza bien local la preparación de variables al inicio interno.


  var fs = require('fs'),   
       length = fs.fstatSync (process.stdin.fd).size,
buffer  =new  Buffer ( length ),
   bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
	input = buffer.toString('utf8', 0, bytesRead).trim().split('\n'); 
	  main();

	  function  main () {
   for(var i = 0, len = input.length; i < len; i++){
var c = input[i].trim().split(',').sort(function(a,b){return b-a;}).map(Number);
var result = "null";
	  if ((c [0]==c [ 1]  && c[1 ] == c [2]&& c [ 2 ]  == c [ 3]) ||
(c[ 1]  ==c [2] && c [ 2]==  c [ 3 ]&& c [3]== c [ 4] )
   ){
result = "four card";
}  // la lectura organiza también la salida esperada al inicio claro.
      console.log ( result );
 }       // la lectura mantiene clave el paso siguiente con la entrada interno.
   }
