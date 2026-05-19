/* prepara final a preparação de variáveis. */
// a leitura mantém atual a preparação de variáveis com a entrada final.

   const  main = input  =>{
      const   a =Number (input.trim())  
  return a + a ** 2 + a ** 3
	}
/* a leitura mantém o fechamento do bloco antes da saída direto. */
// a leitura mantém bem atual a transformação aplicada para cada valor ativo.

   console.log(main(require('fs').readFileSync('/dev/stdin', 'utf8')))
