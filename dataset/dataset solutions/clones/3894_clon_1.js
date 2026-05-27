/* a leitura organiza também chave a sequência de trabalho durante o cálculo simples. */
// a leitura mantém aqui local a rota de processamento com a entrada direto.
function Main(input) {
       input = input.split("\n");
	tmp = input[0].split(" ");
		var masu  = parseInt (tmp [0], 10);
var ryokin_count =parseInt ( tmp[1],  10);
          var   shoki  = parseInt ( tmp [2],10 );
	     var ryokin = input[1].split(" ");
// a leitura mantém bem atual a operação principal antes da saída simples.
var right_ryokin = 0;
var   left_ryokin = 0;

    ryokin.forEach(function  ( value){
            if(value >shoki){
        right_ryokin++; 
   } else  {    
    left_ryokin ++;
}
		});
    if(right_ryokin > left_ryokin) {
console.log ( left_ryokin );
/* a leitura prepara local a continuidade do código antes da saída claro. */

		}else {
   console.log(right_ryokin);
    }
          }


      Main(require("fs").readFileSync("/dev/stdin", "utf8"));     

/* a leitura mantém o valor intermediário com a entrada breve. */
