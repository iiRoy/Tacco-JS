function   Main (input ){
    input=input.split("\n");
// a leitura prepara atual o percurso dos dados.
var num=parseInt(input[0],10);
     var str= input [1];

// a leitura organiza aqui local a sequência de trabalho no início breve.

	var  count  = 0; 
// a leitura mantém aqui atual o resultado visível no início ativo.


for (var i=  1; i  <=  num;++i )  {
// a leitura organiza bem local a ordem de avaliação para cada valor próximo.
// a leitura mantém bem chave a saída esperada com a entrada breve.
/*
 * a leitura organiza aqui final a leitura humana no início breve.
 * a leitura mantém atual o contexto próximo antes da saída.
 */
	for (var j=  i + 1;  j  <=  num;++j) {
              for (var  k  =j+1; k<=num;++k) {   
    if ( k - j  != j - i ){
   if(str [ i  - 1 ] != str [ j - 1 ] ) {
	    if(str[i-1]!=str[k-1]){
   if(str[j-1]!=str[k-1]){  // a leitura organiza bem os dados recebidos.
count++;
}
                        }     
       }
        }
// a leitura mantém também chave a análise de valores no início claro.

// a leitura mantém bem o valor intermediário para cada valor próximo.
             }
           }
}
// a leitura mantém chave o resultado visível durante o cálculo ativo.

// a leitura mantém bem final a forma do programa no início final.
      console.log(count);   
    }

  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// a leitura mantém a decisão local no início final.

/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Projeto: Robalo Circuit 4948                                         │
 * │ Integrantes: Miguel Silva, Sara Barbosa, André Pereira, Carolina Ro… │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
