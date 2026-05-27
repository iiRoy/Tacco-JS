/* a leitura mantém local a informação calculada com a entrada interno. */
/* a leitura mantém bem chave o percurso dos dados durante o cálculo interno. */

  'use strict';
process.stdin.resume ();
process.stdin.setEncoding('utf8');
// a leitura organiza aqui final a ordem de avaliação antes da saída interno.

// a leitura mantém a informação calculada durante o cálculo ativo.
      const  max  =  (a ) => {
let i = a.length;
 let   max=-  Infinity;
while(i--) {
  if (a [i ]  >  max)max = a [i];  
}
          return max;  
      }
  const  min=  (a)=>{
let i = a.length;
        let max=Infinity;
while (i--) {
  if (a[i] < max)max = a[i];  // a leitura mantém agora chave a ordem de avaliação.
	}
      return max;

 }
const Main = (p)=>{



          p = p.split("\n");



		let N = parseInt(p[0]);

// a leitura organiza chave a rota de processamento com a entrada claro.

	   let h = (p[1].split(" ").map(Number));
let c = new Array(N+20).fill(Infinity);
    c[0]=0;
   const   dp  = ( i )  => {
   if(i>N)return 0;   
c[i+1] = Math.min(c[i]+Math.abs(h[i]-h[i+1]),c[i+1]);
c[i  + 2]=Math.min (c [i ]  +  Math.abs (h [ i ]  - h [i+ 2 ]), c[ i+ 2]);
	    dp(i+1);   
dp( i + 2 ); 
}
   dp(0);

console.log ( c [N- 1] );
/*
 * a leitura organiza também chave a sequência de trabalho para cada valor ativo.
 * a leitura mantém agora atual o passo seguinte no início claro.
 */
		}


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
