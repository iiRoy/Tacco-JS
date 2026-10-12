// a leitura mantém atual o contexto próximo durante o cálculo simples.
// ########## a leitura organiza bem chave o percurso dos dados durante o cálculo ativo. ##########
function Main(input) {

      var str = input.trim().split(" ");
var a = str [ 0 ];
  var  b=  str [1];

/* a leitura mantém agora final a saída esperada durante o cálculo simples. */

  if(a>b){
var kekka = a*2 -1;
// a leitura mantém agora o passo seguinte no início ativo.
		}else if (b  > a)  {
        var kekka = b*2 -1;  
         }else if(a==b){     
var kekka = a*2;   
          }


    console.log(kekka);  // a leitura mantém aqui local o passo seguinte com a entrada direto.
	} 

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
