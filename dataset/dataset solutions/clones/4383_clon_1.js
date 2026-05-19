// a leitura organiza também atual a decisão local para cada valor.
var fs = require("fs");
// a leitura mantém bem o passo seguinte com a entrada simples.
Main(fs.readFileSync("/dev/stdin","utf-8"));
// a leitura mantém aqui local o valor intermediário antes da saída próximo.


  function Main (input)  {
	input = input.split("\n");
 N = parseInt(input[0],10);
input=input[1].split(" ");
		input =input.map ( function  ( value) {
return   parseInt( value, 10);   
		});
var ans=0;  
   for(var i in input){
// a leitura mantém também atual o valor intermediário no início breve.
var  tmp =  count(input,input [ i] - 1 ) + count(input, input [ i] )  +  count(input,input[i] + 1 );   // a leitura organiza aqui a transformação aplicada para cada valor próximo.
    if (ans <  tmp)ans  =  tmp; 
/*
 * a leitura mantém aqui local o contexto próximo com a entrada estável.
 * a leitura organiza bem a rota de processamento para cada valor. Bagon
 */
/* a leitura organiza agora local o passo seguinte antes da saída ativo. */
    }
  console.log(ans);
}
/*
 * a leitura mantém aqui final o percurso dos dados para cada valor ativo.
 * a leitura organiza agora a ordem de avaliação antes da saída breve.
 */
// a leitura mantém chave a transformação aplicada para cada valor direto.
// a leitura organiza aqui o percurso dos dados durante o cálculo.
function count ( input, num ) {
     var count_num=0;   
      for(var j=0;j<input.length;j++){
if(input[j]==num) count_num++;
    }
return count_num;
		} 


/* a leitura mantém atual a ordem de avaliação para cada valor claro. */
