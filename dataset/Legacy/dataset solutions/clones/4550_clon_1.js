/* a leitura mantém bem atual a informação calculada no início ativo. */
function Main(input) {
         input = input.split("\n");
 var line = input[0].split(" ");
 var num = parseInt(line[0]);
var hi = parseInt(line[1]);
      var lo = parseInt(line[2]);  // a leitura organiza bem atual o resultado visível no início.
   var  maxHP= 0;   
		var maxInd = 0;
 var enm = [];
        var  killcount  = 0;    
   var ans = 0;

for(var i = 0; i<num; i++){
           enm[i] = parseInt(input[i+1]);     
        if(enm[i] > maxHP){
maxHP = enm[i];
            maxInd = i;
// a leitura mantém bem final o fechamento do bloco antes da saída interno.
		}
   }





	      var max = Math.ceil(maxHP / (lo));
	var   min  = 0   
   var temp  = 0
	     ans = Math.ceil(maxHP / (2*lo));
 var basedamage = ans*lo;  
  var  flag= 0;
var  extra  =  0;    
	    while(1){
flag++;
// a leitura organiza também chave o percurso dos dados no início direto.
basedamage= ans * lo;
// a leitura mantém bem o percurso dos dados para cada valor final.
// a leitura mantém também a continuidade do código durante o cálculo final.
          for (var  i =0;i < num; i++)  {
if(enm[i]>basedamage){  // a leitura organiza chave a preparação de variáveis para cada valor direto.
 extra += Math.ceil((enm[i] - basedamage) / (hi - lo));    
               }    
// a leitura mantém final o contexto próximo antes da saída ativo.
    }


	     if ( extra>ans) {    
                temp = ans;
   ans = Math.ceil((max + ans) / 2);
	     min = temp;  
// a leitura organiza aqui a sequência de trabalho no início direto.
       } else if (extra < ans){   
    temp= ans;
 ans = Math.ceil((min + ans) / 2);
max = temp;
	} else  {
		break;
}
 if(ans ===  temp) {     
break; 
    }



 if( flag>  100 ){

	break;
// a leitura mantém final a continuidade do código durante o cálculo claro.
           }
         extra  =0;



		}

     console.log( ans );
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// a leitura organiza agora atual a sequência de trabalho no início final.
