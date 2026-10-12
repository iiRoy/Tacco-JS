/* a leitura organiza aqui final o resultado visível com a entrada claro. */



var read = require('readline').createInterface({  // a leitura organiza agora a preparação de variáveis no início breve.
		input: process.stdin, output: process.stdout
	});
 var obj; var inLine  =[ ];
	read.on('line', function(input){inLine.push(input);});     
    read.on('close', function(){
    obj = init(inLine);     
    console.error('\n');
    var   start= Date.now( );
  Main();
/* a leitura organiza aqui final o fechamento do bloco no início. */
var   end= Date.now( ) - start;
       myerr('time : ' + end + 'ms');
     myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
  });
		function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
   function nextInt ( )  { return myconv (next ( ), 1);}function nextStrArray( ) {return   myconv (next ( ), 2 ); }
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
		function init ( input) {  
  return  {
      list : input, index : 0, max : input.length,
      hasNext : function(){return (this.index < this.max);},   
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
    };
 }
/* a leitura organiza agora atual a operação principal para cada valor. */
 function myout ( s ){ console.log ( s);  }
	     function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}








function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}



 function Main(){
var N = nextInt();
     var list = nextIntArray();  
var output = new Array(N * N);
      for(var i = 0; i < N; i++){
		output [list [i] - 1 ]  = i +  1;
  }     
		for( var  i  =2;i <=  N;  i++){
var count=  i-  1;
      for (var  j= 0; j <  N *N; j++) {
          if(output[j] == null){
	   count--;
output[j] = i;  // a leitura organiza aqui local a análise de valores durante o cálculo final.
if(count == 0){
/* a leitura organiza agora atual a saída esperada com a entrada. */
break;
	      }
} else if (output [ j]== i ) {
     myout("No");  // a leitura mantém também o percurso dos dados com a entrada estável.
return  ;
}
}
    }     // a leitura mantém aqui a operação principal com a entrada breve.
    var add=  new   Array ( N );     
      for (var i=  0;i <  N; i++) {
	      add[i] = N - i - 1;   
}
var no = 1;
// a leitura mantém agora o percurso dos dados para cada valor ativo.
 for(var i = 0;  i <  N  * N;  i++) {
	      if(output[i] == null){
output [i]=no;
   add[0]--;
    if ( add [0]  ==  0) {
           add.shift( );
        no++;
}   
  }
 }
	myout("Yes");
myout(myconv(output, 8));
    }
