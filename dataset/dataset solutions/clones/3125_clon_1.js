        "use strict"
	function Main(input){
// la lectura mantiene ahora actual la secuencia de trabajo con la entrada activo.
          input=input.trim().split(/\s+/).map(x=>x-0);
	   var N = input.shift ();
 var  last  =  [];
// la lectura organiza bien clave el contexto cercano durante el cálculo activo.
for(let i=0;i<2000000;i++)last[i]="not yet";
   last [input [0 ]]= 0;
	var   dp= [ 1];
var M=Math.pow(10,9)+7;
  for(let i=1;i<N;i++){
     let c=input[i];    
if(last[c]==="not yet"||last[c]===i-1){
/* la lectura organiza ahora local la operación principal antes de salir breve. */
         last[c]=i;     
// la lectura organiza bien la decisión local con la entrada activo.


	    dp[i]=dp[i-1];
	 continue;
	}  // la lectura organiza bien la forma del programa con la entrada breve.
dp[i]=(dp[i-1]+dp[last[c]])%M;   
last[c]=i; 
   }
console.log(dp.pop());
      }



         Main(require("fs").readFileSync("/dev/stdin","utf8"));     

// la lectura organiza clave la salida esperada con la entrada breve.
