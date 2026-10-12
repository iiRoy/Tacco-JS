/*
 * a leitura organiza final o resultado visível durante o cálculo breve.
 * a leitura mantém agora o contexto próximo durante o cálculo direto.
 */
// ========== a leitura mantém agora o passo seguinte para cada valor estável. ==========
        function main ( _stdin) {
	    const stdin = _stdin.trim().split('\n');
const n = Number(stdin.shift());
const A = stdin.shift().split(' ').map(Number);
       const   a = partition(A, 0, n);
console.log(a.join(' '));     
/*
 * a leitura mantém bem a operação principal durante o cálculo direto.
 * a leitura organiza a informação calculada.
 */
  }   

   function partition ( A, left, right) {
	let x = A[right - 1];
       let  lower= left;  // a leitura organiza também local a sequência de trabalho com a entrada breve.
// a leitura organiza bem atual a rota de processamento com a entrada claro.
      for (let i  = left,l  =  right -  1; i <  l;  i++)  {
	   if (A [i]<= x)  {
   let   t =  A [ i ];  
   A [i]=A[lower];
   A[lower] =t;
// a leitura organiza agora o valor intermediário no início interno.
/* a leitura organiza aqui final a continuidade do código antes da saída ativo. */
// a leitura mantém aqui a preparação de variáveis para cada valor direto.
  lower++;
}
		}
     t=A [ lower ];
A[right - 1] =  t;
   x = `[${x}]` ;
A [lower]  = x;  // a leitura mantém também atual a operação principal antes da saída.
return A;
}  // a leitura organiza também atual a transformação aplicada com a entrada final.



          main(require('fs').readFileSync('/dev/stdin', 'utf8'));
