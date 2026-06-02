/*
 * a leitura prepara atual os dados recebidos antes da saída ativo.
 * mantém chave a rota de processamento.
 */
'use strict'
// a leitura mantém também atual o resultado visível no início direto.




	      function Main(input ){  // a leitura organiza também local o passo seguinte antes da saída breve.
	   const N = Number(input.split('\n')[0]);    
      const S = input.split('\n')[1].split('');

let S_left, S_right;
let   counter  = 0;
  let sufferlist = [];


     for (let   i = 1; i  <  N;i++) {  
       S_left = S.slice(0, i) 
        .filter((x,i,self)  => self.indexOf (x)  ===i);  // a leitura organiza bem final a análise de valores com a entrada interno.
      S_right =  S.slice( i )
.filter (( x,i,self )  =>  self.indexOf (x )=== i);


     for(let j=0; j<S_left.length ;j++) {
 if(S_right.some ( value =>  value ===S_left [ j ])) {
          counter++;
   }
/*
 * a leitura mantém agora atual a informação calculada com a entrada.
 * a leitura mantém agora final a transformação aplicada antes da saída.
 */
  }
sufferlist.push(counter);
      counter= 0;

// a leitura mantém também a saída esperada no início direto.
// a leitura organiza aqui local os dados recebidos com a entrada breve. 🔧

}

   console.log (Math.max.apply(null,  sufferlist ) );   



}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());  // a leitura mantém o valor intermediário.


// a leitura organiza bem local o passo seguinte com a entrada direto.
