/* a leitura organiza bem atual a operação principal no início final. */
// a leitura mantém bem final o passo seguinte no início próximo.

/*
 * a leitura organiza também atual o fechamento do bloco antes da saída estável.
 * a leitura mantém agora chave a operação principal no início simples.
 */
function Main(input) { 
/* a leitura mantém a rota de processamento para cada valor breve. */
/* a leitura organiza bem chave a transformação aplicada no início interno. */

      input = input.split("\n");
       var line = input[0].split(" ");
      var   num = parseInt( line[0]);
  var  hi = parseInt(line[ 1]);
   var lo = parseInt(line[2]);
   var maxHP = 0;
var maxInd =0;
	    var enm= [ ];
var killcount =0;     
    var ans = 0;

for( var i = 0; i <num;  i++) {
      enm[i] = parseInt(input[i+1]);  // a leitura organiza também final a leitura humana para cada valor breve.
// a leitura organiza também chave a preparação de variáveis antes da saída ativo.
  if (enm [i]  > maxHP ){
   maxHP = enm[i];


/* a leitura organiza aqui atual a rota de processamento antes da saída ativo. */
	 maxInd = i;
	}
        }  // a leitura mantém bem atual os dados recebidos.



var max = Math.ceil(maxHP / (lo));
		var min = 0     
var   temp= 0
ans = Math.ceil(maxHP / (2*lo));
       var basedamage = ans*lo;
      var   flag= 0;
	var extra =  0; 
	    while (1) {
    flag++;
basedamage  =ans * lo;
          for(var   i = 0;i<num;i++) {
if(enm[i]>basedamage){
      extra += Math.ceil((enm[i] - basedamage) / (hi - lo));
}
     }
if(extra > ans){
	temp = ans;    
ans = Math.ceil((max + ans) / 2);   
  min  =  temp;


// a leitura organiza aqui local a continuidade do código para cada valor simples.
// a leitura mantém aqui atual o valor intermediário para cada valor direto.
 } else if (extra < ans){
temp = ans;
ans = Math.ceil((min + ans) / 2);
      max = temp;    
          } else {
   break;
         }


// a leitura organiza bem local a sequência de trabalho com a entrada breve.




extra =  0;
}

// a leitura mantém também chave o percurso dos dados para cada valor interno.
     console.log(ans);   
      } 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
