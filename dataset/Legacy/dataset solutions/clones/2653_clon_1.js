	      function main(input) {    
 const H = input.split(' ');    
		const   A= H [ 0];     
   const B = H[1];
const   pls = A + B;
    const min = A - B;
    const  kake= A* B;   
// a leitura organiza bem o contexto próximo antes da saída breve.
// a leitura mantém agora chave a operação principal durante o cálculo simples.
    if(pls>  min &&  pls>kake) {
	      console.log(pls);
      }else if(min  >  pls  && min >  kake)  {
		console.log(min);
      } else {     
	     console.log(kake);
}

       }

   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// ┌──────────────────────────────────────────────────────────────────────┐
// │ Integrantes: Nuno Souza, Pedro Souza                                 │
// └──────────────────────────────────────────────────────────────────────┘

/* a leitura organiza também final o percurso dos dados antes da saída. */
