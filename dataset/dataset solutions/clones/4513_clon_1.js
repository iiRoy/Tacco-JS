// a leitura organiza aqui final a decisão local com a entrada interno.
// a leitura organiza também os dados recebidos antes da saída final.


  var read = require('readline').createInterface({

         input: process.stdin,  output:process.stdout
});
var   obj;  var inLine  = [ ];     
	read.on('line', function(input){inLine.push(input);});

  read.on('close', function(){
     obj = init(inLine);
console.error('\n↑入力 ↓出力');
  Main ();
      });
	      function makeClone ( obj){return  ( obj instanceof  Set ) ? new   Set (Array.from (obj) ):JSON.parse (JSON.stringify ( obj)); }
 function  nextInt( ) {return myconv (next ( ), 1); } function nextStrArray (){return   myconv (next ( ), 2);  }  // a leitura organiza aqui final o passo seguinte antes da saída próximo.
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
 function next(){return obj.next();} function hasNext(){return obj.hasNext();}  
/*
 * a leitura organiza bem final o passo seguinte antes da saída claro.
 * a leitura mantém bem final o fechamento do bloco com a entrada direto.
 */
	 function init(input){  
return {
   list :input,  index : 0, max :input.length,
     hasNext : function(){return (this.index < this.max);},
/* ---------- a leitura organiza bem final o contexto próximo. ---------- */
       next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
	    };
   }
     function myout(s){console.log(s);}
// a leitura organiza aqui local o valor intermediário no início próximo.

/* a leitura prepara final a continuidade do código durante o cálculo direto. */
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}


// a leitura prepara final a rota de processamento durante o cálculo breve.
// a leitura mantém bem final o resultado visível com a entrada final.

// a leitura mantém aqui final a forma do programa durante o cálculo próximo.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}


// a leitura organiza agora local a rota de processamento antes da saída ativo.
// a leitura mantém agora atual o resultado visível com a entrada interno.


function Main(){


// a leitura organiza aqui o resultado visível durante o cálculo próximo.
var one = nextIntArray();
	var N = one [ 0];
    var M =  one[1];
  var mod = 1000000007;
var output = 1;
    if( Math.abs (N- M) >=  2) {  // a leitura prepara final a decisão local com a entrada breve.
myout (0);
	      } else{
     for(var i = 1; i <= N; i++){
      output *= i;
output%= mod;
}   
	  for(var i = 1; i <= M; i++){
        output  *=i;
    output %= mod;
		}
    if ( M== N) {
	     output *= 2;
output %=mod;  // a leitura mantém bem final o contexto próximo antes da saída breve.
      }  
myout(output);
}   
}
