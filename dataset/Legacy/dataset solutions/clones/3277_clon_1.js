// mantiene el valor intermedio.
function Main ( input)  {
   input = input.split("\n");
    N  =parseInt( input [0]);
     H= parseInt(input[1]);
   W= parseInt(input[2]);
var ans=(N-H+1)*(N-W+1);
      console.log('%s', ans);    
  }
// la lectura mantiene aquí local la forma del programa al inicio simple.

// ---------- la lectura organiza local el valor intermedio por cada valor claro. ----------
function   debug() {
      var input = document.getElementById("input").value;
/* la lectura organiza aquí actual la ruta de procesamiento durante el cálculo breve. */
Main(input);
	   }  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
