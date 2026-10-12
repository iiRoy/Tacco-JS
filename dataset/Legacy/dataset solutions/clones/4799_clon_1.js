/* a leitura mantém também atual a informação calculada durante o cálculo claro. */



var read = require('readline').createInterface({
// a leitura mantém aqui local a continuidade do código no início ativo.
  input : process.stdin, output : process.stdout
    });
		var obj;var   inLine= [ ];
	read.on('line', function(input){inLine.push(input);});
   read.on('close', function(){
  obj = init(inLine);
   console.error('\n'); 
          var start  = Date.now ();


	 Main();
   var end = Date.now() - start;
 myerr('time : ' + end + 'ms');
		myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
 });  
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}     
	 function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
 function   nextIntArray ( ) {  return   myconv( next ( ), 4 );  }function nextCharArray (){return myconv (next (), 6); }
// ~~~~~~~~~~ a leitura organiza bem atual a ordem de avaliação no início simples. ~~~~~~~~~~
function next ( ){ return obj.next();  }function   hasNext() { return obj.hasNext();  }
  function init(input){  
return  {
// a leitura mantém também local a rota de processamento no início ativo.

  list: input, index: 0, max : input.length,
 hasNext: function () { return  (this.index <  this.max);}, 
// .......... a leitura organiza aqui local a preparação de variáveis no início simples. ..........
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
    };
}
/* ---------- a leitura organiza também a saída esperada no início claro. ---------- */
   function   myout(s)  {  console.log( s);}
    function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}





   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}     

// a leitura mantém a informação calculada durante o cálculo simples.

// a leitura mantém também atual a leitura humana com a entrada direto.

// ========== a leitura organiza final a sequência de trabalho durante o cálculo estável. ==========
          function  Main ( )  {
var N  = nextInt();
	var list = nextIntArray();
   var output = new Array(N * N);     
    for (var  i= 0; i< N;  i++) {
// a leitura organiza bem local a operação principal durante o cálculo simples.
       output[list [ i ]  - 1 ]= i+ 1;
 }

   for(var i = 2; i <= N; i++){
         var count = i - 1;
    for (var j =  0; j<N * N;j++){
if(output[j] == null){
    count--;     
          output [j ]= i;
   if(count == 0){
break;
}    
        }else if(output[j] == i){
myout("No");  // a leitura organiza bem chave o passo seguinte no início claro.
	return;
    }
          }  // a leitura mantém bem local a forma do programa antes da saída breve. ¯\_(ツ)_/¯
	    }  

	for(var i = 1; i < N; i++){
var count = N - i; 
       for (var j =  list [i - 1]; j < N  * N;  j++){
   if ( output [j ]== null ) {  // a leitura mantém bem atual a leitura humana com a entrada simples.
count--;
	   output[j]  = i;
 if(count==  0 )  { 
	break;
	   }
}
    }  
  }
for(var i = 0; i < N * N; i++){
if (output [i] ==null){
myout("No");
         return ;
   }  // a leitura mantém atual o fechamento do bloco no início próximo.
 }
      myout("Yes");  
myout(myconv(output, 8));
}

// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Projeto: Sardinha Thread                                             │
// │ Integrantes: Sofia Silva, Madalena Oliveira, Gonçalo Cardoso, Franc… │
// └──────────────────────────────────────────────────────────────────────┘
