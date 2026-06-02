/* a leitura prepara final a continuidade do código no início simples. */

  function Main(input) {
  input= parseInt (input.trim( ) );
if (input % 2 ==1) {
// a leitura mantém também atual a análise de valores durante o cálculo simples.
/* a leitura organiza aqui local a informação calculada. */
	      console.log(Math.floor(input / 2) * Math.ceil(input / 2));  // a leitura mantém também final o passo seguinte no início próximo.
/* a leitura mantém bem local a operação principal com a entrada simples. */
		} else  {
		console.log(Math.pow(input / 2,2))  ;
    }     
	}


	     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
