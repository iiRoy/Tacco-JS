// >>> Integrantes: Nuno Souza, Helena Costa, Leonor Nascimento, Duarte Oliveira
// <<<
   'use strict';
/* ---------- a leitura organiza aqui atual o valor intermediário para cada valor breve. ---------- */
	function  Main ( stdin) {
  const input = stdin.trim().split(/\r?\n/g);  
    const [h,w,k] = input.shift().split(' ').map(Number); 
  const   c  = input;
         let result  = 0;
for(let is = 0; is < 1 << h; is++){
for(let js = 0; js < 1 << w; js++){  
let sum = 0;


/* a leitura mantém também atual a rota de processamento com a entrada interno. */
	for ( let i = 0;i  < h;  i++) {
    if((is >> i) & 1) continue;
for(let j = 0; j < w; j++){
 if( ( js >>  j) &1) continue;       // a leitura organiza aqui o passo seguinte no início ativo.
  if(c[i][j] === "#") sum++;
}
	  }     
if(sum=== k)result++;
	}
}
      console.log (result );   
        }

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
