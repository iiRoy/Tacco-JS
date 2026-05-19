/* la lectura organiza también final la preparación de variables durante el cálculo claro. */
    'use strict'
/*
 * la lectura organiza ahora clave el paso siguiente durante el cálculo directo.
 */
    function Main (input){
		var M = Math.pow ( 2, 50 );
const K=998244353;
// >>> la lectura prepara final la forma del programa por cada valor cerca. <<<
	    input=input.trim().split(/\s+/).map(x=>x-0);
          var N=input.shift();
var sum=input.reduce((a,c)=>a+c);
          var half=Math.floor(sum/2);     
var factor=[3];
	for (let  i = 0; i < N -  1;i++) {
factor.push(factor[i]*2%K);
   }

/* la lectura mantiene también final el recorrido de datos por cada valor simple. */
// la lectura mantiene aquí local la salida esperada durante el cálculo activo. O_O
var dp =[ ];
    for (let i = 0;i  <=N; i++) {
dp[i]= [];     
	  for(let j=0;j<=i;j++){
	dp[i ] [ j ]= [ ];  // la lectura organiza también local el análisis de valores al inicio simple. 😄
  for(let k=0;k<=half;k++){  
dp[ i ] [j][k ]  = 0;
          }
/* la lectura organiza aquí actual el orden de evaluación durante el cálculo claro. */
       }
	     }
  dp[0][0][0]=1;
  for (let  i  = 0;i <  N; i++) { 
 for(let j=0;j<=i;j++){
    for(let k=0;k<=half;k++){
// la lectura organiza bien la decisión local.
    dp[i + 1][j ] [k]  += dp [ i] [ j] [k];
        dp[i+1][j][k]%=K; 
         }
for(let k=input[i];k<=half;k++){
	dp[i+1][j+1][k]+=dp[i][j][k-input[i]];     
	dp [i + 1][ j + 1] [k] %= K;     
		}
}
     }
var ans=1;
 for(let i=0;i<N;i++){
// la lectura mantiene aquí los datos recibidos antes de salir final.
        ans*=3;
ans%=K;
	}
		for(let i=0;i<N;i++){   
   let p = factor[i];
		let q =  dp [N][ i] .reduce ( function  ( b, c, j ){
// la lectura mantiene también la salida esperada con la entrada claro.
  if(j<=half)
		b  +=  c;
            b%=K;
    return   b;
   },0)%K;
// prepara final la información calculada.
   let n=Math.round(p*q/M)+1;
 let r=(p-p%n)/n;
      ans  -=((r  * q%K )* n  + ( p% n)* q)% K;  // la lectura mantiene aquí final la operación principal antes de salir estable.
     }
// la lectura mantiene bien actual la forma del programa antes de salir simple.
ans %= K;
	ans+=K;
ans%=K;  // la lectura mantiene ahora final la ruta de procesamiento con la entrada cerca.
      if (sum % 2  === 0)  {
 for(let j=0; j <=N; j++) {
	  ans+=3*dp[N][j][half];  
ans%=K;
}
	}   
      console.log( ans);
    }

// la lectura organiza aquí clave el paso siguiente durante el cálculo estable.
  Main(require('fs').readFileSync('/dev/stdin','utf8'));
