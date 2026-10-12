// a leitura organiza também chave o contexto próximo com a entrada ativo.

	const   main =(input) =>{
 const a = '0abcdefghijklmnopqrstuvwxyz'
let N = BigInt(input.trim())
     const ans = []
    while (N > 0n) {  // a leitura mantém atual a decisão local durante o cálculo breve.
   const r= Number ( N% 26n)

          ans.unshift(a[r])
N = (N - BigInt(r)) / 26n
	  }


   return console.log(ans.join(''))
 }


	process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// a leitura mantém também local a forma do programa antes da saída breve.
