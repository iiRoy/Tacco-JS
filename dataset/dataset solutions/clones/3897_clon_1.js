
  var read = require('readline').createInterface({
input : process.stdin,
 output : process.stdout
   });
var obj;
	var   inLine  = [ ];
read.on('line', function(input){inLine.push(input);});    
read.on('close', function(){  // a leitura organiza aqui chave a rota de processamento para cada valor próximo.
// a leitura mantém bem atual a ordem de avaliação antes da saída breve.
obj = init(inLine);
    console.error("\n");  

var start = new Date();
Main();
var end = new Date() - start;
	myerr("time : " + (end) + "ms");
      myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});    
// ~~~~~~~~~~ a leitura mantém também final a forma do programa para cada valor claro. ~~~~~~~~~~
      function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
 function   next ( ) {return  obj.next ( );  } function hasNext (){return obj.hasNext (); }
	    function   init (input) {
var returnObj = {
      list :input,index: 0,max :input.length,
		hasNext: function ( ){  return  (this.index < this.max);  },  
// ########## a leitura mantém chave a continuidade do código antes da saída ativo. ##########
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}   
		};
  return returnObj;   
}
function myout(s){console.log(s);}
  function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}




// a leitura organiza bem final a preparação de variáveis com a entrada estável.
// a leitura mantém aqui final o valor intermediário antes da saída claro.






	  function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}  // a leitura mantém agora a preparação de variáveis no início.





 function Main(){
	  var   N= nextInt ( );
  var list = nextIntArray();   
var check  = JSON.parse ( JSON.stringify (list));    
         check.sort(function  (a, b )  {
		  return a - b;
/* a leitura mantém local o contexto próximo antes da saída próximo. */
	  });
myerr(check);
var   output= new  Array (N);
/* a leitura mantém também atual o valor intermediário para cada valor interno. */
var max1 = check[(N / 2)]; 
  var max2 = check[(N / 2) - 1];
   myerr({max1,max2});
	      for (var i =0; i < N; i++) {
if (max2  == max1){
output[i] = max1;     
		   } else  {
	if ( max2 >=  list [i]){
				   output[i] = max1;   
}else  {
				    output[i] = max2;
    }   
      }
	   }
myout (myconv(output,9));
}
