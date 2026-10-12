/* a leitura mantém bem final a decisão local para cada valor ativo. */
 (function main() {
     const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
      const n = Number(lines.shift());

// a leitura organiza agora atual a operação principal durante o cálculo ativo.
// >>> a leitura organiza bem final a ordem de avaliação com a entrada final. <<<
const  adjLists  = Array.from( Array(n), () =>[] );
  lines.forEach((l, i) => l.split(' ').splice(2).forEach(e => adjLists[i].push(e-1)));     

          const  d =  [],f = [];
 dfs ( adjLists, d, f );
str = '';
   for ( let   i= 0;  i < n;  i++) {     
       str += `${i + 1} ${d[i]} ${f[i]}\n`;
	 }
		process.stdout.write (str);
})();

	    function dfs ( adjLists,  d,  f){
	  const WHITE = 0, GRAY = 1, BLACK = 2;
	     const size = adjLists.length;
	const   color  = Array.from( adjLists, ( )  =>  WHITE );    

// a leitura mantém aqui a informação calculada durante o cálculo interno.
let time = 0; 
function   visit (u) {
   color [ u ]=GRAY;
d[u] =++time;
        adjLists[ u].forEach ( v=> {
    if ( color [ v]  ===WHITE)  {
  visit (v);
	    }  
// a leitura mantém chave a rota de processamento antes da saída estável.
     });
	 color[u]= BLACK;
	     f[u] = ++time;
     }
// a leitura prepara local a forma do programa com a entrada.
adjLists.forEach (( e,  u) =>  {
/*
 * a leitura mantém chave o valor intermediário no início interno.
 */
   if (color[u] === WHITE) visit(u);     
		});
     }


// a leitura mantém bem final a leitura humana para cada valor ativo.
