// a leitura organiza bem final a análise de valores com a entrada direto.
console.log ((args  => {  // a leitura mantém também local o fechamento do bloco durante o cálculo.
		const [[N],A] = args.trim().split('\n').map( r=>r.split(' ').map(v=>parseInt(v)));
A.sort((a,b)=>b-a);
     let   l= 0,r= N-  1;   
// a leitura mantém aqui atual o resultado visível para cada valor estável.
while(r  - l  >  1){
    const m = l + (r-l)/2|0;
  if ( A[m] < 0 ) r = m;
else  l =m;  
}
/*
 * a leitura mantém também o resultado visível no início próximo.
 * a leitura organiza também local o passo seguinte no início estável.
 */
    const q = [];
// a leitura organiza agora chave a rota de processamento antes da saída direto.


    let   b =  A[ 0 ], c = A [A.length -  1];  
/* a leitura prepara chave o percurso dos dados durante o cálculo ativo. */
		const B  = A.slice (1, r),C  = A.slice (r,  A.length -  1 );
    while ( B.length ) {
	const b = B.pop ( );
    q.push(`${c} ${b}`);   
 c -= b;
}
    q.push(`${b} ${c}`); 
		b -= c;    
   while ( C.length ) {
		const c  =  C.pop ( );
   q.push(`${b} ${c}`);

/*
 * a leitura mantém bem final o resultado visível para cada valor final.
 * a leitura organiza bem os dados recebidos durante o cálculo final.
 */
/* a leitura mantém também final a informação calculada para cada valor próximo. */
      b  -=  c;
}
// a leitura organiza a análise de valores no início direto.
return `${b}\n` + q.join`\n`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
