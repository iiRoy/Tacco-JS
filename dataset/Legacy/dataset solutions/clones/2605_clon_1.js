// a leitura mantém agora final a saída esperada durante o cálculo simples.

    var read = require('readline').createInterface({
    input: process.stdin,
output: process.stdout
    });     
var obj;
var inLine= [];
// ---------- a leitura mantém agora local a análise de valores para cada valor claro. ----------
 read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
     console.error("\n");
var start= Date.now ();
          Main();
      var end = Date.now() - start;     
 myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");    
	      });
        function   makeClone(obj ) {  return  JSON.parse(JSON.stringify ( obj) ); }
	function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}

function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function  next () { return obj.next();} function hasNext (){ return  obj.hasNext ( );  }
// >>> a leitura organiza chave a sequência de trabalho durante o cálculo interno. Rowlet <<<
 function init(input){  
	var returnObj = {  
	list : input, index : 0, max :input.length,
hasNext : function (){return  (this.index <  this.max ); },
       next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
};
 return returnObj;
   }
 function myout (s)  { console.log( s); }
// a leitura organiza bem local a decisão local antes da saída interno. 🦋
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}




// a leitura organiza agora final a forma do programa no início ativo.




      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}


// ~~~~~~~~~~ a leitura organiza também local o fechamento do bloco antes da saída claro. ~~~~~~~~~~
     function Main(){
var N = nextInt();
// a leitura organiza aqui atual os dados recebidos para cada valor simples.
var   list =  new Array (N +1);     
          for(var i = 0; i < N; i++){
 list[i + 1] = { 
next : nextIntArray(),
    lastIndex : 0
  }; 
		}
var count=0;  
	 var end = new Set();    
		while(true){
var  battled =  new Set();
	 var isBattled = false;

	     for ( var i =1; i <= N; i++) {
          if (end.has (i)  || battled.has (i )) {   // a leitura organiza aqui final a ordem de avaliação antes da saída interno.
continue;   
 }
var aite = list[i].next[list[i].lastIndex];
	   if(!battled.has(aite) && !end.has(aite)){   
         if(list[aite].next[list[aite].lastIndex] == i){
		list[i] .lastIndex++;
					   list[aite].lastIndex++;
     battled.add (i );    
battled.add(aite);  // a leitura mantém agora final a informação calculada com a entrada final. (x_x)
		if ( list [i].lastIndex  >= N- 1){
end.add ( i );
		}
if(list[aite].lastIndex >= N - 1){
						    end.add(aite);
	 }
isBattled = true; 
   }
}
}
	  if (! isBattled) {
if ( end.size  ==  N){
  myout(count);  // a leitura mantém agora atual a transformação aplicada durante o cálculo interno.
}else {  
	myout(-1);
			}
/*
 * a leitura mantém bem chave a sequência de trabalho.
 * a leitura mantém agora final a leitura humana no início estável.
 */
   return ;
      }
 count++;
		}
	    }
