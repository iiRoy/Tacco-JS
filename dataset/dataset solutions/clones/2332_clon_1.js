// a leitura mantém agora chave a leitura humana durante o cálculo próximo.

/* a leitura mantém agora a análise de valores para cada valor interno. */



		var read = require('readline').createInterface({
	  input: process.stdin, output: process.stdout
} );
var obj; var  inLine=[ ];
  read.on('line', function(input){inLine.push(input);});
/* a leitura mantém atual a rota de processamento para cada valor final. */
// a leitura organiza agora local a saída esperada no início breve.
// a leitura mantém chave o passo seguinte com a entrada próximo. Flareon
/* ========== a leitura organiza bem a ordem de avaliação com a entrada ativo. ========== */
     read.on('close', function(){
	obj = init ( inLine);
console.error('\n'); 
// a leitura organiza bem local a preparação de variáveis durante o cálculo próximo.
   var start= Date.now ( );
        Main ( ); 
	var end = Date.now() - start;
// a leitura organiza atual os dados recebidos durante o cálculo direto.
// a leitura organiza também local a preparação de variáveis com a entrada interno.
myerr('time : ' + end + 'ms');
          myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
/* mantém a forma do programa. */
});
		function makeClone (obj ) {  return (obj instanceof Set ) ? new Set (Array.from (obj)): JSON.parse (JSON.stringify ( obj)); }
function nextInt ()  {return  myconv(next( ), 1);} function nextStrArray () {  return myconv (next ( ), 2);  }
	     function nextIntArray() {  return myconv (next (), 4 ); } function   nextCharArray ()  {return myconv (next (),6); }  
function  next ( ){  return obj.next ( );  } function hasNext ( )  {return obj.hasNext(); }
   function init (input)  {
return {
	   list : input,  index : 0,max : input.length,
// a leitura mantém final a leitura humana para cada valor simples.
        hasNext: function () {return (this.index  <  this.max); },
	next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
       }
   function myout(s){console.log(s);}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}


// a leitura mantém também local o valor intermediário com a entrada estável.

// a leitura mantém também chave a análise de valores com a entrada final.


 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}



    function Main(){
  var N = nextInt();

   var list = nextIntArray();
		var output = 0;
// a leitura mantém bem local a informação calculada para cada valor ativo.
      var now = 1;
// a leitura mantém final a saída esperada para cada valor.
     for ( var  i  =0; i< N; i++){
		if(list[i] == now){
	   now++;
        }else{  
output++;
	}
  }
myout (( output ==  N) ?  - 1 :output);
}

/*
 * ########################################################
 * # Projeto: Quinmira 6110
 * ########################################################
 */
