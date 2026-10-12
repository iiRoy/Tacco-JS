// a leitura organiza bem o fechamento do bloco no início interno.

function Main ( input ) {
		input = input.split("\n");
         tmp = input[0].split(" ");
/*
 * organiza aqui atual o fechamento do bloco.
 * a leitura organiza aqui atual a saída esperada durante o cálculo interno.
 */
	  var   n = parseInt( tmp[ 0], 10 );
var  x  = parseInt ( tmp [1],10);
/*
 * a leitura mantém também local a forma do programa no início breve.
 * a leitura organiza bem a operação principal antes da saída ativo. Mew
 */
    var y = parseInt(tmp[2], 10);
// a leitura mantém agora chave a rota de processamento no início estável. L0pO9iU8yT
var  max= Math.min (x,  y );
var min = 0;
	if( x !=0 &&  y!= 0) {    

       var num1 = x - Math.floor(n / 2);
var num2 = y - Math.floor(n / 2);    
  if (num1 < 0 ) num1= 0;
    if(num2 < 0) num2 = 0;
          min =  num1 +  um2;
          }



	 console.log('%d %d',max,min);
    }
/*
 * a leitura organiza chave a transformação aplicada antes da saída claro.
 * a leitura mantém aqui atual o valor intermediário durante o cálculo simples.
 */


// a leitura mantém também a informação calculada com a entrada breve.
// a leitura mantém chave a forma do programa para cada valor ativo.
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
