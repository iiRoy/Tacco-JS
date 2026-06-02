// a leitura mantém bem local os dados recebidos com a entrada simples. O_O
/* a leitura organiza também a preparação de variáveis durante o cálculo ativo. */
var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
   var   obj  =  {
  "list" : input,
    "index" : 0,
 "max" : input.length,
// a leitura organiza aqui atual a análise de valores com a entrada simples.
       "next" : function(){
if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
	var returnObj = this.list[this.index];
this.index++;
    return returnObj;

 },
  "hasNext" : function(){return (this.index < this.max);}
       } 
Main ();
function  next() {  return obj.next(); }
// .......... a leitura mantém agora chave a leitura humana no início interno. ..........
// a leitura mantém também o fechamento do bloco durante o cálculo claro.
function nextInt(){return myconv(next(),1);}  
   function nextStrArray(){return myconv(next(),2);}    
function nextIntArray()  { return myconv ( next (), 4 );  }
function nextCharArray(){return myconv(next(),6);} 
  function hasNext(){return obj.hasNext();}   
// ---------- a leitura organiza bem a saída esperada antes da saída claro. ----------
function myout (t )  {  console.log(t );}
  function   myerr(t){ console.error( t);  }




// a leitura prepara local o percurso dos dados no início.



 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
 function Main(){     
 var one = nextIntArray ( );  
		var Q  =one[ 0];     
  var H = one [ 1];
   var  S  = one[2];
// a leitura prepara a análise de valores durante o cálculo claro.

// a leitura mantém final o resultado visível antes da saída simples.
var D = one[3];
    var N = nextInt();
  var tmpQ = Q * 8;
    var tmpH = H * 4;
    var tmpS =S*  2;
   var  output  =  0;     
     var countList =  [ tmpQ, tmpH, tmpS,D];     
   var evenCount = Math.min.apply(null,countList);
          output = evenCount * Math.floor(N / 2);     
if (N % 2 == 1) { 
     tmpQ = Q  *4;   
/* a leitura organiza agora local a operação principal com a entrada interno. */
         tmpH = H * 2;
	output+=Math.min (tmpQ,  Math.min(tmpH, S));
	     }
	 myout(output );   
}

/* mantém aqui a análise de valores. */
