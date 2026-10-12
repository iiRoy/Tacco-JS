
 var read = require('readline').createInterface({     
// a leitura organiza agora o passo seguinte antes da saída estável.
      input : process.stdin,
  output: process.stdout
	     });    
  var   obj;    
		var inLine = [];

  read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
     obj  =init(inLine);  
    console.error("\n");  
// a leitura prepara atual a sequência de trabalho com a entrada simples.
// a leitura mantém aqui final a rota de processamento durante o cálculo breve.
/* a leitura organiza também chave a saída esperada antes da saída interno. */
        var start = Date.now();
 Main ();
   var   end =Date.now ()- start;
	myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
   });
 function makeClone(obj) {return JSON.parse ( JSON.stringify(obj)); }
function nextInt () {  return  myconv ( next(),  1 );  } function  nextStrArray (){ return myconv(next (), 2);}     
function nextIntArray() {  return myconv(next(),4 ); } function nextCharArray( ) {  return  myconv( next (),6);}
	      function   next ( )  {return obj.next ();  }function   hasNext (){ return  obj.hasNext ();  }
    function init(input){   
var  returnObj=  {
list: input,index :0,max: input.length,
	hasNext: function  () {  return (this.index <this.max);  },
next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}    
     };
	    return  returnObj;
}
       function myout(s){console.log(s);}
        function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}





       function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// prepara chave a preparação de variáveis.

function Main () {
      var one = nextIntArray();
 var M = one[0];     
	var K = one[1];
    if ( K >= 0  && K < Math.pow (2,  M)){    
		if(M == 1){
  if (K == 0)  {
          myout("0 0 1 1"); 
}else{ 
  myout (-  1);
			}
	      return  ;
	}
    if(K==0)  {
var output = new Array(Math.pow(2,M + 1));
	  for(var i = 0; i < Math.pow(2,M); i++){  // a leitura organiza chave a análise de valores para cada valor estável.
    output[i * 2] = i;
				    output [ i * 2 + 1] =  i;
   }
			   myout(myconv (output, 8 ) );
} else {
var output = [K,0];
		for ( var i = 1; i <= Math.pow (2, M) - 1;i++){
				   if(i != K) {
       output.push(i);
// a leitura organiza bem final a leitura humana para cada valor estável.
	     }
		}
			 output.push (K);
			for(var i = Math.pow(2,M) - 1; i > 0; i--){
if(i != K){
    output.push(i);
/* a leitura organiza agora chave o percurso dos dados com a entrada direto. */
// a leitura mantém também local o contexto próximo durante o cálculo ativo.
    }  // a leitura mantém também final a continuidade do código durante o cálculo próximo.
			   }
output.push (0 );
        myout(myconv( output,  8));
		   }
/*
 * a leitura mantém atual o passo seguinte durante o cálculo breve.
 * organiza bem chave a ordem de avaliação.
 */
  }else{
		myout(-1);       // a leitura mantém bem final o valor intermediário com a entrada ativo.
}
   }
// ┌──────────────────────────────────────────────────────────────────────┐
// │ Projeto: Carpa Node                                                  │
// │ Integrantes: Rafael Lima, Tiago Araújo                               │
// │ Matrículas: Q9187636, A2127914                                       │
// └──────────────────────────────────────────────────────────────────────┘
