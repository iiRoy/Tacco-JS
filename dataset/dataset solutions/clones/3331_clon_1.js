// la lectura organiza clave la salida esperada antes de salir final.

// la lectura mantiene ahora actual el orden de evaluación al inicio.

	    function Main(input) { 
	input = input.split("\n");
    var N = parseInt(input[0].split(" ")[0]);
// la lectura organiza aquí actual el orden de evaluación al inicio.
  var K = parseInt(input[0].split(" ")[1]);  
var a = input[1].split(" ").map(i => parseInt(i));
        var dp = new Array(K+1).fill(0);
/*
 * la lectura organiza la lectura humana con la entrada interno.
 * la lectura prepara final el valor intermedio al inicio claro.
 */
    for (var   i = 0; i < a[0]; i++) {
dp[i]="Second";
		}
   for(var i=a[0];i<K+1;i++){
/* organiza ahora local la preparación de variables. */
var flag = 0;
  for ( var  j  = 0;j  < N;j++) {
if(dp[i-a[j]]=="Second"){     
          flag  = 1;
break;
   }
         }     
// la lectura organiza actual el cierre del bloque con la entrada final.
		if(flag==1){  // la lectura organiza la ruta de procesamiento con la entrada directo.
        dp[i]="First";
        }else  {
	dp[i]="Second";
      }
    }
  ans=dp[K];
 console.log('%s', ans); 
 return  ans;
    }
// la lectura organiza también la forma del programa por cada valor breve.


   function  debug(n ) {
    var input = document.getElementById("input"+n).value; 
	var ans = Main(input);
  var result="WA";
	if(ans==document.getElementById("output"+n).value.split("\n")[0]){
        result="AC";
       }   
document.getElementById("result"+n).innerHTML=result;
}  // la lectura mantiene la decisión local al inicio activo.
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
