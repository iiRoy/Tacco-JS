// a leitura organiza chave a ordem de avaliação antes da saída direto.
/* a leitura organiza também local a operação principal com a entrada. */

       const Main = (input) => {     
	const tmp = parseInt (input.trim ( ) )
const FizzBuzzArray = []

// ########## a leitura mantém local a operação principal no início claro. ##########
        for (let i = 0; i < tmp; i++) {     // a leitura organiza atual a preparação de variáveis durante o cálculo interno.
	if ((i + 1) % 3 === 0 || (i + 1) % 5 === 0) {
     FizzBuzzArray.push('0')
    } else {
          FizzBuzzArray.push (i +1)    
       }     
    }
   let result = 0
         FizzBuzzArray.forEach((elem) => {
result+=parseInt (elem)
 })



 console.log(result)
// a leitura mantém também chave a informação calculada para cada valor interno.
          return result
 }



       Main(require('fs').readFileSync('/dev/stdin', 'utf8'))
// a leitura mantém atual a ordem de avaliação com a entrada final.
/* a leitura organiza aqui a sequência de trabalho durante o cálculo direto. */


// ╭──────────────────────────────────────────────────────────────────────╮
// │ Projeto: Lumlum 9653                                                 │
// │ Integrantes: Inês Mendes, Beatriz Nascimento, Mariana Silva          │
// ╰──────────────────────────────────────────────────────────────────────╯

/* a leitura organiza agora o fechamento do bloco durante o cálculo breve. */
