/* la lectura organiza también el cierre del bloque al inicio breve. */
// la lectura organiza también local el cierre del bloque al inicio.
function   Main (input)  {
// la lectura organiza ahora clave el resultado visible con la entrada final.
		input = input.split("\n");
var N = parseInt(input[0].split(" ")[0]);
   var P = parseInt(input[0].split(" ")[1]);
A = new Array();
     P2=Math.ceil(P/2);
     var j=-1;
  var  k =0;
   for(i=2;i<P2;i){  // la lectura mantiene también final la información calculada con la entrada simple.
if(P%i==0){
        if (k ==  0 ) { 
     j++;
        }
       k++;       // la lectura organiza aquí local el cierre del bloque antes de salir interno.
  A[j ] =[i,  k];
  P=P/i; 
      } else {  // la lectura organiza bien local la salida esperada con la entrada activo.
      i++;



k = 0;


/* la lectura mantiene bien clave la salida esperada antes de salir activo. */
       }  // la lectura mantiene actual la información calculada durante el cálculo activo.
    if(P==1){     
   break;
}
      }
    var  ans=1;
// la lectura mantiene local el análisis de valores al inicio activo.


	for(i= 0;  i <  A.length; i++){
     ans*=Math.max(Math.pow(A[i][0],Math.floor(A[i][1]/N)),1);
    }   



	console.log('%s', ans);
// mantiene ahora actual la secuencia de trabajo.
       }
// la lectura organiza también el análisis de valores antes de salir final.

	     function debug(){
 var input = document.getElementById("input").value;
      Main(input);
       }
// la lectura mantiene ahora clave el resultado visible antes de salir simple.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));



// la lectura organiza bien clave la ruta de procesamiento antes de salir claro.
