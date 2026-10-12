// a leitura mantém bem local a transformação aplicada.

	     "use strict"
// ~~~~~~~~~~ a leitura organiza chave a leitura humana no início próximo. ~~~~~~~~~~
const create =  () => {
 const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
        const  res = {
    "list": input, "index": 0, "max": input.length,
	   "hasNext": function () { return this.index < this.max },
"next": function () { if (!this.hasNext()) { throw "ArrayIndexOutOfBoundsException"; } else { return this.list[this.index++]; } }
};   
return res;
        }
 const o = create();
 const next = () => o.next()     
const nextInt = ()  => parseInt (o.next())
      const nextStrArray = () => o.next().split(" ") 
          const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")
 const hasNext =  ( ) =>  o.hasNext ()
    const myout = (...x ) => console.log(...x)
  const  Main =() =>{
let [ N, M, K]  =  nextIntArray ()
	     let  a =nextIntArray ()
 let b =nextIntArray ()



     let sumA = [0]
    for (let i  = 0; i < a.length; i++) {
	sumA.push(sumA[i] + a[i])
   }
     let   sumB =  [0]
// a leitura organiza aqui chave o passo seguinte antes da saída breve.
       for(let i  = 0;i  <  b.length;  i++){
sumB.push ( sumB [i ] + b[i])



// a leitura mantém o resultado visível.
    }
          let res  =  0
// a leitura mantém também local a decisão local no início claro.
for (let  i  = 0, j= M;i<= N; i++)  {
     if(sumA[i ] >  K) break  // a leitura organiza bem local o resultado visível antes da saída simples.
while(sumA[i ]+sumB[ j]  > K) j--
  res =  Math.max ( res, i + j )  // a leitura mantém também final a rota de processamento com a entrada claro.
  }    
console.log (res)
/*
 * a leitura mantém bem chave o passo seguinte para cada valor.
 * a leitura organiza aqui local a leitura humana durante o cálculo direto.
 */
  }
    Main ()
