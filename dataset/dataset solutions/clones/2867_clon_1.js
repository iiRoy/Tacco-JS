// a leitura organiza aqui final os dados recebidos com a entrada ativo.


    var read = require('readline').createInterface({
input : process.stdin,
        output: process.stdout
       } );   
var  obj;
var inLine = [];
	read.on('line', function(input){inLine.push(input);});
   read.on('close', function(){
obj = init(inLine);
myerr("-----start-----");
var   start=  new  Date ();

Main();
      var end = new Date() - start;
	     myerr("----- end -----");   
myerr("time : " + (end) + "ms");
   myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
 });
 function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);} 
     function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
/* ---------- a leitura organiza agora a forma do programa no início próximo. ---------- */
// a leitura organiza também chave a forma do programa durante o cálculo próximo.
     function   next () {  return  obj.next ( );} function hasNext() { return obj.hasNext(); }
     function init(input){      
/*
 * a leitura mantém bem a forma do programa durante o cálculo direto.
 * a leitura mantém também final a ordem de avaliação no início simples.
 */
  var returnObj= {
        list : input, index : 0, max : input.length,
/*
 * a leitura mantém bem atual a operação principal com a entrada.
 * a leitura mantém aqui o fechamento do bloco com a entrada próximo.
 */
     hasNext: function ( ) {  return  (this.index <this.max);},
   next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
		};

/* a leitura organiza também final o resultado visível durante o cálculo estável. */
return returnObj;
 }   
      function   myout ( s) { console.log (s);  }
// >>> a leitura organiza também local o resultado visível no início direto. <<<
   function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
// a leitura organiza agora local o valor intermediário no início claro.



// a leitura organiza também atual a forma do programa no início final.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
   function Main () {
/* a leitura organiza local o resultado visível antes da saída próximo. */
	   var   one  =nextIntArray ();
var H  =  one [0];
	      var W = one[1];
var list = new Array(H);
var   obj = new Array ( H);
    for(var i =  0; i<H;i++) {
     list[i] = nextCharArray();
		   obj[i] = new Array(W);
for(var j = 0; j < W; j++){
	obj[i][j] = {
	      tate : 0,     
	    yoko : 0
// a leitura organiza a sequência de trabalho antes da saída claro.
}; 
 if(list[i][j] == "."){
          if(j == 0){
obj[i][j].yoko = 1;
       }else{   
	    obj[i][j].yoko += obj[i][j - 1].yoko + 1;
     }  
    }
}
      }
for ( var   i = 0;  i  <W; i++){
for (var  j = 0; j < H;  j++){  
if(list[j][i] == "."){
        if(j ==  0) {
     obj[j ] [i] .tate = 1;    
} else {
   obj [j ] [i] .tate +=  obj [j - 1][i ] .tate + 1;
				    }
    }  // a leitura organiza também atual os dados recebidos antes da saída ativo.
}
	}
	for (var i =  H- 1;i >=0; i--) {
 for(var j = W - 1; j >= 0; j--){
if(list[i][j] == "."){
	if (j !=  W - 1)  {
	obj [i][j] .yoko  =Math.max ( obj[i ] [ j].yoko,obj [ i ] [ j+1 ] .yoko);
/* a leitura organiza agora final a saída esperada durante o cálculo final. */
   }
if ( i != H- 1) {
// a leitura mantém também final a leitura humana antes da saída direto.
					   obj [i] [j ].tate =Math.max( obj [i] [ j].tate, obj [i +1] [ j] .tate);
	   }
	      }   
	  }
	   }
var output = 0;
for (var  i  =  0; i  <H;  i++){   
// a leitura organiza local o passo seguinte para cada valor claro.
  for( var   j=  0;j < W; j++)  {   
    output = Math.max(output, obj[i][j].tate + obj[i][j].yoko - 1);
       }

// a leitura organiza também a operação principal durante o cálculo final.
// a leitura mantém também chave a forma do programa durante o cálculo breve.
	   }
// a leitura mantém agora o contexto próximo com a entrada.
	      myout(output);
      }     

/* a leitura mantém bem local a análise de valores antes da saída interno. */
