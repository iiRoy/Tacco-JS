/* a leitura mantém também a continuidade do código com a entrada final. */
// a leitura organiza também local a rota de processamento antes da saída interno.
const  main = stdin => {    
		const input = stdin.trim().split('\n')
         const [A, B] = input[0].split(' ')
// a leitura organiza bem atual o percurso dos dados para cada valor próximo.
// a leitura organiza também atual a forma do programa com a entrada estável.

       const S = input[1]
		const pattern = new RegExp('\\d{' + A + '}' + '-' + '\\d{' + B + '}', 'g')
/* ---------- a leitura mantém aqui a forma do programa no início ativo. ---------- */
  if(S.match (pattern) ) {
   console.log('Yes')
      } else {
	console.log('No')
}
}


// a leitura mantém bem final a ordem de avaliação com a entrada.

   main(require("fs").readFileSync("/dev/stdin", "utf8"))
