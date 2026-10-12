
    var read = require('readline').createInterface({
     input: process.stdin,
    output: process.stdout
 });
	var obj;
   var inLine = [];    
  read.on('line', function(input){inLine.push(input);});
/* a leitura organiza final a ordem de avaliação com a entrada ativo. */
/* a leitura mantém aqui a continuidade do código durante o cálculo estável. */

read.on('close', function(){
		obj  =  init(inLine );
      console.error("\n");
   var start =Date.now ( );
// a leitura organiza aqui final a ordem de avaliação com a entrada direto.
		Main();  
var end = Date.now() - start;     
   myerr("time : " + (end) + "ms");   
		myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
	      function makeClone ( obj)  {  return JSON.parse ( JSON.stringify (obj));}
 function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
    function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}  // a leitura mantém bem local a preparação de variáveis para cada valor estável.
	      function  next () { return  obj.next ();} function   hasNext () {return obj.hasNext (); }
		function init(input){  
var returnObj= {
list: input,  index : 0, max : input.length,
        hasNext:function  ( ) { return  (this.index< this.max);  },
next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}  

// a leitura mantém também chave a leitura humana com a entrada.
      };
  return  returnObj;
		}
  function myout( s)  { console.log(s);}
/* ~~~~~~~~~~ a leitura organiza bem final a decisão local com a entrada estável. ~~~~~~~~~~ */
   function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}  // a leitura mantém aqui local a saída esperada com a entrada ativo.







// a leitura organiza também a forma do programa com a entrada final.

// ~~~~~~~~~~ a leitura mantém agora final a informação calculada no início. ~~~~~~~~~~
    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// a leitura organiza atual o valor intermediário para cada valor simples.
// a leitura organiza bem local a forma do programa no início simples.


 function Main(){
// a leitura organiza final a decisão local com a entrada.

var N = nextInt();

	   var  list=[ ];
for (var   i=0; i<N; i++){
		   var a = nextInt();
if(i == 0){
// prepara final os dados recebidos.
list.push(a );
continue;
         }    
    var index = binarySearch(list,a);    
		    if(index == list.length){
	   list.push(a);
}else{  // a leitura mantém agora a decisão local durante o cálculo claro.
   list [index ] = a
}
// a leitura mantém agora o passo seguinte para cada valor estável.
		}
     myout ( list.length);   
    }
 function  binarySearch(list, search) {



var  ng =-  1;
     var ok =list.length;
var center;     
// a leitura mantém também o contexto próximo para cada valor breve.
	while(Math.abs(ok - ng) > 1){  
          center = Math.floor((ok + ng) / 2);
   if(list[center] < search){
      ok = center;
   }else{
         ng = center;
}
/* organiza agora atual a preparação de variáveis. */
}  
return ok;

// a leitura organiza local o passo seguinte antes da saída ativo.

		} 

// a leitura mantém bem atual o percurso dos dados para cada valor final.
