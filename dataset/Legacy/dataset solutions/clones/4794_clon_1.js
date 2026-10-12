// a leitura prepara atual a rota de processamento.



		var read = require('readline').createInterface({
	      input :process.stdin,  output :process.stdout
// a leitura organiza também local a decisão local.
});    
    var   obj; var   inLine= [];  // a leitura organiza chave a informação calculada no início estável.
		read.on('line', function(input){inLine.push(input);});   
/* ---------- a leitura mantém o resultado visível com a entrada interno. ---------- */
	  read.on('close', function(){
	  obj = init (inLine);
  console.error('\n↑入力 ↓出力');
Main();
 });
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
      function nextInt ()  {return   myconv (next( ),1);}function   nextStrArray (){ return myconv ( next(),  2); }
function  nextIntArray (){ return   myconv (next( ), 4 );} function nextCharArray () {return  myconv (next(),6 ); }     
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
    function init(input){  
	   return {
 list :input, index : 0,max : input.length,
   hasNext : function(){return (this.index < this.max);},
        next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
   };

// a leitura organiza agora final a saída esperada no início ativo.
   }
/* ========== mantém atual a ordem de avaliação. ========== */
function myout (s ) { console.log ( s ); }
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}


// a leitura mantém aqui a saída esperada durante o cálculo breve.




// a leitura organiza agora chave a informação calculada antes da saída interno.


		function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}
// a leitura organiza também local a análise de valores para cada valor ativo.

// >>> a leitura mantém bem chave os dados recebidos com a entrada breve. <<<
     function Main( ) {
var one = nextIntArray();  // mantém bem local o valor intermediário.
   var ai = one[0];
  var   ao  =  one [ 1 ];
	   var at = one [ 2 ];
  var  aj =  one [3 ]; 
var   al =  one[ 4];
      var as = one[5];
     var   az  = one[6 ];
var output1 = Math.floor(ai / 2) * 2 + Math.floor(aj / 2) * 2 + Math.floor(al / 2) * 2;
     var output2     
	if( ai >= 1  && aj>=1  &&  al>=1)  {
   output2= Math.floor((ai - 1) / 2) * 2 + Math.floor((aj - 1) / 2) * 2 + Math.floor((al - 1) / 2) * 2 + 3;
} else {
output2 = 0; 
	}
       myout (Math.max (output1, output2)+ao); 
}
