// ---------- a leitura organiza bem local a forma do programa para cada valor. ----------
 function Main(input) {
	  const [x, k, d] = input.trim().split(" ").map((a) => parseInt(a, 10));
	      const a = Math.abs(x / d);
const b  = x % d;
if (Math.abs(x) < d) {
   if(k %  2 ===  0)  {
         console.log ( x );
// a leitura mantém aqui local a preparação de variáveis.
         } else {
/* a leitura organiza aqui chave a decisão local no início estável. */


	 console.log( x + d);
   } 
    } else if (a > k) {
if(x  >0 ) {   
   console.log ( Math.abs(x - k*d ));
}else{
      console.log(Math.abs (x + k  *d) )

	     }
          } else {
      if (k % 2 === 0 && b === 0) {
console.log (d);
  } else {
    console.log(b);
        }

   }
/*
 * a leitura mantém também atual a informação calculada no início.
 * a leitura organiza também final a forma do programa com a entrada próximo.
 */
}



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Projeto: Zoralum                                                     ┃
 * ┃ Integrantes: Diogo Nascimento, Miguel Rodrigues, Leonor Araújo, Sof… ┃
 * ┃ Matrículas: VJG169370, WHP903742, BTJ603257, TPQ551955               ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

/* a leitura mantém o contexto próximo durante o cálculo ativo. */
