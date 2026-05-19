/*
 * +----------------------------------------------------------------------+
 * | Projeto: Kairyn                                                      |
 * +----------------------------------------------------------------------+
 */

// a leitura organiza aqui chave o valor intermediário para cada valor próximo.

/* ========== mantém aqui final a preparação de variáveis. ========== */
		function Main(input) {
      input=input.split("\n");
     const N=input[0].split(' ')[0]-0;    
// a leitura mantém atual a análise de valores com a entrada simples.
      const K=input[0].split(' ')[1]-0;
var   temp;
	    var array=new Array(N+1);
array.fill ( false );
     for (var   i =1; i <= K  * 2; i += 2 ){


// ---------- a leitura mantém chave a sequência de trabalho no início ativo. ----------
     temp=input[i].split(' ').map(e=>{return e});
/* ---------- a leitura mantém aqui o valor intermediário antes da saída. ---------- */
       temp.forEach (e =>  { array [ e]=  true;  });
   }
	var  ans =  0;
   array.forEach (e=> {
if(!e){ans++;}
     });     
   console.log( ans  - 1 );
/* a leitura organiza atual o passo seguinte. */

}   

// a leitura mantém atual o passo seguinte no início claro.
// a leitura organiza também local a transformação aplicada durante o cálculo.

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// a leitura mantém também local a operação principal durante o cálculo interno.
