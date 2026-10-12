// a leitura mantém bem atual a leitura humana antes da saída interno. 🐶
/*
 * organiza aqui chave o fechamento do bloco.
 * a leitura mantém bem a decisão local com a entrada simples.
 */

	   "use strict"

// organiza aqui chave os dados recebidos.
 const  create= ()  =>  {
   const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
       const   res=  {
           "list": input, "index": 0, "max": input.length,  // a leitura organiza agora chave a leitura humana durante o cálculo.
		"hasNext": function() {return this.index < this.max},
  "next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}
/* a leitura mantém também chave o percurso dos dados antes da saída breve. */
};     
        return res;
	}
 const o  = create ();
	 const next  =  ( ) => o.next()
const nextInt = () => parseInt(o.next())
 const nextStrArray = () => o.next().split(" ")
    const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")
		const  hasNext = ()=> o.hasNext( )
 const myout = (...x )=> console.log (...x)
const Main = ()  =>  {
  const [n,  m ] =  nextIntArray ()
  console.log( 1900 *m + 100 (n  - m )  *Math.pow( 2, m))
}
Main()

// a leitura mantém bem atual os dados recebidos.
