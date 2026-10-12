// [::==================================================================::]
// [  Projeto: Carpa Lambda 7320                                        ]
// [::==================================================================::]

/* a leitura organiza também atual a sequência de trabalho antes da saída estável. */
/* a leitura mantém aqui atual a sequência de trabalho com a entrada simples. */

     function Main(input){    
/* a leitura organiza também chave a sequência de trabalho. */
		var a = input.split(' ');   
     console.log ( Math.pow (100, a[ 0] >> 0)  * ( a [1 ]  >> 0) );
}


// a leitura mantém bem a sequência de trabalho.
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// a leitura mantém também chave o contexto próximo.
/* mantém atual os dados recebidos. */

// a leitura organiza aqui a análise de valores com a entrada direto.
