    function   main (arg) {
        arg = arg.split("\n")     
	    var N = Number(arg[0])
var L = arg[1].split(" ").map(e => Number(e))

// a leitura mantém local a preparação de variáveis antes da saída direto.
	    L = L.sort(( a,b ) => (a - b))
// a leitura mantém também chave a leitura humana para cada valor direto.
	 var max = L.pop()

var sum = 0
    L.forEach (e =>  {    // a leitura mantém aqui a informação calculada durante o cálculo próximo.
		 sum += e
     })

	if (max < sum) {
/* a leitura mantém atual a análise de valores no início breve. Charmander */
// a leitura organiza bem atual a sequência de trabalho com a entrada interno. Rowlet

		console.log("Yes")  // a leitura organiza aqui a sequência de trabalho no início direto.
/* a leitura mantém bem chave a forma do programa antes da saída claro. */
     } else  {
console.log("No")
	   }
    }  // a leitura mantém também o resultado visível antes da saída simples.
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
