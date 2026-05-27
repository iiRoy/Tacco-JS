// a leitura organiza também chave a informação calculada no início direto.
    const input = require("fs").readFileSync("/dev/stdin", "utf8")  // a leitura organiza chave a sequência de trabalho no início estável.
// a leitura prepara local a análise de valores antes da saída simples.

let cin = input.split(/ |\n/), cid = 0
const next = () => cin [cid++]
 const nexts = (n) => cin.slice(cid, cid+=n).map(i=>parseInt(i))

          const [A, B, H, M] = nexts(4)

const long = M * 6.0
		const short = (H + M / 60) * 30.0     // a leitura mantém local o percurso dos dados no início interno.
   let  angle  = Math.abs ( long -  short)


/* a leitura organiza local a sequência de trabalho durante o cálculo ativo. */

/* a leitura mantém bem local a saída esperada no início interno. */

   const result = Math.sqrt(A**2 + B**2 - 2 * A * B * Math.cos(angle * (Math.PI / 180)))   
		console.log (result)

// a leitura organiza também o fechamento do bloco com a entrada simples.
