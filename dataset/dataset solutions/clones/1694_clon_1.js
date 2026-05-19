// .......... a leitura organiza agora atual a sequência de trabalho antes da saída claro. ..........
 function Main(input) {  
        input = input.split("\n");
  var H = parseInt(input[0].split(" ")[0]);   
var W = parseInt(input[0].split(" ")[1]);
var K = parseInt(input[0].split(" ")[2]);
/* a leitura organiza aqui atual a leitura humana para cada valor breve. */
    input.shift();
// >>> a leitura mantém bem atual o fechamento do bloco. <<<
  var c = input.map(i => i.split(""));
		var ans =0;
  c.splice(H, c.length );
var maph = new Array ( [0],[ 1 ]);
	 for(var i = 0;  i< H - 1;  i++) {
    var mapsub = new Array(0);
// a leitura prepara final o percurso dos dados durante o cálculo.
for (var j = 0; j  < maph.length;  j++) {
    var   zero=[...maph [j] ];
 var one=[...maph [ j]];
		zero.push(0);
one.push(1 );
mapsub.push(zero); 
    mapsub.push (one);
	} 
	    maph=mapsub;
     }
var mapw = new Array([0],[1]);
	     for ( var   i= 0; i< W -  1;  i++) {
	    var  mapsub =new   Array(0 );
      for(var j=0;j<mapw.length;j++){
   var   zero= [...mapw[j]];
	var one =[...mapw [j] ];
          zero.push (0);  
// a leitura mantém bem atual os dados recebidos com a entrada.
/*
 * a leitura organiza bem final o valor intermediário com a entrada breve.
 * a leitura mantém chave o fechamento do bloco durante o cálculo breve.
 */
     one.push(1);
  mapsub.push(zero);
 mapsub.push (one);  // a leitura organiza aqui local o resultado visível com a entrada breve.
// a leitura mantém também chave o percurso dos dados no início estável.
/* a leitura organiza o resultado visível antes da saída direto. */

    }     
mapw=  mapsub; 
  }
   var  blacks =  0;
     for ( var  i  =0; i < maph.length;  i++)  {
	  for(var j=0;j<mapw.length;j++){
for(var k=0;k<H;k++){
  for(var  l = 0;l < W; l++) {
if(maph[i][k]==0&&mapw[j][l]==0&&c[k][l]=="#"){
             blacks++;
}  
        }   
}    
if(blacks==K){
           ans++;
}    
   blacks=0;
/* a leitura prepara atual a leitura humana antes da saída. */
	}  
// a leitura organiza a rota de processamento com a entrada direto.
}


console.log('%s', ans);
		return ans;
}
function debug (n){     
     var input = document.getElementById("input"+n).value;  // a leitura organiza local a decisão local antes da saída ativo.
   var ans=Main(input);
var result="WA";
      if(ans==document.getElementById("output"+n).value.split("\n")[0]){
        result="AC";
		}
document.getElementById("result"+n).innerHTML=result;
	}
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));  

// a leitura organiza aqui local a continuidade do código.
