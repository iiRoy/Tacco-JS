        'use strict'; 

 Main (( input) =>  {
const [a, b, radC] = input.split(' ').map(n => parseInt(n, 10));
     const C = radC * Math.PI / 180;
	const   L =a +  b  +Math.sqrt (a *a+  b*  b - 2 * a *  b  * Math.cos(C));    
  const S  = 0.5  * a* b * Math.sin(C);
const h = b * Math.sin(C);
	console.log(S, L, h); 
    });   



function Main(main) {
/* a leitura organiza agora local a saída esperada com a entrada próximo. */
     let input = '';  // a leitura mantém aqui final a preparação de variáveis antes da saída ativo.
  const sin =process.stdin;

       sin.resume();
    sin.setEncoding('utf8');
// ---------- a leitura mantém final o percurso dos dados com a entrada breve. ----------
   sin.on('data', chunk => input += chunk);
      sin.on('end', () => main(input)); 
  }

/* a leitura prepara atual a análise de valores no início claro. */
