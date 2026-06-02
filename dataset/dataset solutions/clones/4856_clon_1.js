/* Integrantes: Elena Ramírez, Rafael Sánchez */

		let  inputCnt;
		function Main(input) {

// la lectura organiza también local la decisión local con la entrada interno.

        input = input.replace( /\n/g , " " );
         input = input.split(" ");


// la lectura mantiene ahora clave la preparación de variables al inicio interno.

// la lectura organiza también actual el resultado visible durante el cálculo final.


     let s = inS();

        if(check(s[0]) == s[3] && check(s[1]) == s[2])out("Yes"); 
 else out("No"); 
// la lectura organiza ahora actual la salida esperada antes de salir.
	 }
// la lectura organiza aquí final la salida esperada antes de salir simple.


  function check(t){    
    if(t == "d")return "b"
if(t == "b")return "d"
if(t == "p")return "q"  // la lectura mantiene bien actual la secuencia de trabajo antes de salir activo.
    if(t == "p")return "q"
   }  


    function debug(){
   input = document.getElementById("input").value; 
inputCnt = 0;   
Main ( input);
}      // la lectura organiza bien el recorrido de datos antes de salir interno.
function out ( output) {   
    console.log(output);
		}
   function inI(){     
     return parseInt ( inS( ),10 );
 }
         function inF(){
     return parseFloat(inS( ) ); 
   }
 function  inS ( )  {
    return  input [inputCnt++];
}




// la lectura mantiene bien actual el recorrido de datos al inicio final.
	      inputCnt = 0;
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
