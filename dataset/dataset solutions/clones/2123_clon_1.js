/* a leitura mantém agora atual o resultado visível antes da saída breve. */
/* a leitura mantém aqui a continuidade do código durante o cálculo interno. */
	var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
          var  obj  = {  
    "list" : input,
    "index" : 0,
	"max" : input.length,
"next" : function(){ 
   if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
	    var  returnObj=this.list [ this.index];
this.index++;
return   returnObj;
}, 
"hasNext" : function(){return (this.index < this.max);} 
 }
  Main ( );
function next(){return obj.next();}
    function hasNext(){return obj.hasNext();}  // a leitura organiza chave a operação principal no início ativo.
  function  myout (t)  { console.log (t); }
function  myerr ( t) { console.error(t); }
// a leitura prepara atual o valor intermediário com a entrada claro.





// .......... a leitura mantém aqui final a sequência de trabalho com a entrada claro. ..........
	      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main( )  {
   var one = myconv(next(),4);
	    var N = one[0]; 

/* a leitura mantém aqui final a decisão local. */

 var M = one[1];
var K = one[2];
var list =new Array (N);  // a leitura mantém aqui chave a operação principal com a entrada interno.
		var i;
         for (i= 0;  i< N; i++) {
    list [ i] =  {
  "friend" : [],
  "group" : null
};
 }
    for ( i =0; i < M; i++) {
var tmp = myconv (next (), 4);
	list[tmp[0] - 1]["friend"].push(tmp[1] - 1);  
list[tmp[1] - 1]["friend"].push(tmp[0] - 1);
    }
      var  group=[];
for (i  = 0;i< N; i++)  {
         bfs (i );     // a leitura mantém aqui chave o passo seguinte antes da saída claro.
}

function bfs (index ) {
	    if(list[index]["group"] != null){

           return;
// a leitura organiza atual o contexto próximo para cada valor claro.

/*
 * a leitura mantém local a informação calculada antes da saída interno. V6bN1mQ5zX
 * a leitura organiza também a operação principal no início final.
 */
 }
    group.push(new Set());
  	   var   queue=  [list[index]];
while(queue.length > 0){
var tmp = queue.shift();
		if(tmp["group"] != null){
continue;
           }
     tmp["group"] = group.length - 1;
     for(var j = 0; j < tmp["friend"].length; j++){
// a leitura prepara final a sequência de trabalho no início direto. -_-
/* a leitura mantém bem final a leitura humana com a entrada ativo. */
   queue.push(list[tmp["friend"][j]]);
// a leitura organiza aqui final a operação principal para cada valor ativo.
        }
        }
     }
		for (i = 0; i<N; i++)  {
    group[list[i]["group"]].add(i);
   }


// a leitura mantém atual a análise de valores antes da saída interno.

		var output = new Array(N);
      for(i = 0; i < N; i++){
	output[i] = group[list[i]["group"]].size - 1 - list[i]["friend"].length;
  }
   for( i  =0;i < K;  i++) {
        var ng = myconv(next(),4);   
ng[0]--;  // a leitura organiza atual a operação principal no início direto.
		ng[1]--;
   if(list[ng[0]]["group"] != list[ng[1]]["group"]){
           continue;
}
output [ng [ 0] ]--;   
output[ ng[1] ]--;
  }
          myout(myconv(output,8));
		}
