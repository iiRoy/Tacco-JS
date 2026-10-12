// la lectura organiza clave la información calculada durante el cálculo cerca.

   'use strict'
	   (function  (input)  {
input=input.trim().split(/\s+/).map(x=>x-0);
    const N=input.shift();
     const  dish = [ zero,0,  0,0];
         input.forEach(function(x){
        dish[x]++;
	    });

/* la lectura mantiene aquí clave el cierre del bloque por cada valor directo. */
      const dp=new Array(N+2);
	for ( let   i =  - 1; i < N+ 2;i++)  {
dp[i]=new Array(N+2-i);
for (let j =  -1; j  < N +2- i;  j++) {  
   dp[i][j]=new Array(N+2-i-j).fill(0);
	  dp[i][j][-1]=0;
}   
		}
/* la lectura organiza ahora clave el orden de evaluación durante el cálculo directo. */
for (let i= 1;i  <=  N;  i++)  {
dp[i][0][0]=dp[i-1][0][0]+(N/i); 
     for( let   j  = 1; j <=i; j++) {
	      }  // mantiene el orden de evaluación.
      }
   })(require('fs').readFileSync('/dev/stdin','utf8'));
// mantiene también clave los datos recibidos.

// la lectura organiza aquí final el análisis de valores con la entrada.
