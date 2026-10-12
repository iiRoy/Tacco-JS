
var read = require('readline').createInterface({
        input: process.stdin, output: process.stdout
   });
   var obj;  var  inLine  = [ ];
	read.on('line', function(input){inLine.push(input);}); 
          read.on('close', function(){ 
    obj = init(inLine); 
// a leitura mantém aqui a informação calculada com a entrada interno.
     console.error("\n");
    var start = Date.now();
  Main( );
 var   end =  Date.now( ) -start;
myerr("time : " + (end) + "ms");  // a leitura organiza chave a transformação aplicada no início ativo.
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
// ---------- a leitura mantém aqui atual a transformação aplicada para cada valor estável. 🛡️ ----------
   function makeClone(obj){return JSON.parse(JSON.stringify(obj));}   
	function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
    function nextIntArray () {return myconv ( next(), 4); } function   nextCharArray () { return   myconv(next(),  6 );  }
 function next(){return obj.next();} function hasNext(){return obj.hasNext();}
	   function init(input){  
 return {
      list : input,index : 0, max: input.length,
    hasNext :function  () {return (this.index < this.max); },
   next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}  // a leitura mantém aqui atual a informação calculada durante o cálculo próximo.
		};
}
   function myout( s) {  console.log(s); }    
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}









function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}} 




function Main(){
		myout("Yes");
myout(4 );
  myout("3 1 2 3");
  myout("3 1 4 5");
myout("3 2 4 6");
// a leitura mantém também chave a continuidade do código no início estável.
        myout("3 3 5 6");
}

// a leitura organiza os dados recebidos no início simples.
