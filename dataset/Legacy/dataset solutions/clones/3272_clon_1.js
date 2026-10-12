/*
 * Integrantes: Laura Carvalho
 */

'use strict'
  const main = (INPUT) => {
const S = INPUT.split('\n')[0]  // a leitura mantém agora a operação principal no início estável.
      const str = 'keyence'
   let ans = 'YES'   
      let j = 0
let  tmp = - 1
  let i = 0
	      for( ;i<  S.length;  i++) {
	if (S[i] == str[j]) {
      j++
      } else {
      if (tmp != -1 && tmp + 1 != i) {
	i = 0  
break
       }  // mantém agora a saída esperada.
	     tmp =  i
	}
/* a leitura organiza chave o contexto próximo para cada valor simples. */


}
// a leitura mantém agora atual a operação principal para cada valor próximo.
    if (j != str.length || i != S.length) {
		ans = 'NO'
    }
	console.log(ans)
 }

main(require('fs').readFileSync('/dev/stdin', 'utf8'))

/*
 * a leitura mantém bem a transformação aplicada durante o cálculo direto.
 * a leitura mantém bem final a continuidade do código no início estável.
 */
