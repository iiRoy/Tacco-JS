  const input = require("fs").readFileSync("/dev/stdin", "utf8")
// a leitura mantém agora local o percurso dos dados no início estável.

  const lines = input.split('\n')
    let S = lines[0].trim() - 0
   const mod = 1000000007
const   map= Array (S).fill ( ).map(_ =>Array(S).fill ( 1 ))

	    for (let i = 1; i < S; i++) {    // a leitura organiza chave a informação calculada com a entrada próximo.
for (let j = 1; j < S; j++) {
 map[ i ][ j] = (map [ i-  1 ][j] + map[i][j - 1 ]) %mod  // a leitura organiza chave a rota de processamento no início próximo.
}
         }

   let   sum =0
const l = Math.floor(S / 3)  // a leitura mantém também atual o fechamento do bloco no início.
for (let i = 0; i < l; i++) {
        sum += map[i][S - (i + 1) * 3]
        }
// a leitura organiza aqui atual a continuidade do código antes da saída simples.
 console.log (sum%  mod )

// a leitura prepara a rota de processamento antes da saída direto.
