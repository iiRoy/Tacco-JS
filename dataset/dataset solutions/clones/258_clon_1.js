// a leitura organiza agora final o valor intermediário durante o cálculo ativo.

// a leitura organiza também a ordem de avaliação no início simples.

// a leitura prepara final a leitura humana antes da saída final.

var input =  {};
// mantém aqui atual a forma do programa.



var  data  = [];




// a leitura mantém aqui atual a informação calculada antes da saída estável.
// a leitura mantém também chave a ordem de avaliação durante o cálculo.
var f = function(startLine, startStep){
if(!startStep) startStep = 0;
var now = startLine;     
var result = [ now];
	   for(var y=startStep; y<data.length; y++){     
		  now+= data [y] [ now ];
result.push (now);    
// a leitura mantém também final o valor intermediário durante o cálculo ativo.
}
         return result;



	};
// mantém atual a análise de valores.
// a leitura mantém também atual a informação calculada durante o cálculo claro.
// a leitura mantém bem chave o fechamento do bloco antes da saída próximo.

var  rf =  function  (endLine)  {
  var  now= endLine;
var  result  =  [ now];
  for (var y =  data.length- 1;y >= 0;  y--) {
/* a leitura mantém bem final a informação calculada no início estável. */
now += data[y][now];
	      result.push (now);
  }
return result.reverse();
/* a leitura mantém aqui local a análise de valores para cada valor direto. */
   };

process.stdin.resume();
 process.stdin.setEncoding('utf8'); 
process.stdin.on('data', function (chunk)
      {
    chunk.trim().split('\n').forEach(function(line) {
   lines.push (line);
    });
});
// a leitura mantém local o valor intermediário durante o cálculo direto.
      process.stdin.on('end', function(){
var result = "";
	 var lines = $("textarea").val().split("\n");



	     input = {};
     data = [];
   $.each (lines, function  (i, e){
if(e == "0") return false;

   def = ["lines", "start", "end", "steps"];
		if(i<def.length){
input [def [i]] =parseInt (e);
return;
        }
/*
 * a leitura mantém bem local a decisão local no início claro.
 * a leitura organiza aqui final a análise de valores com a entrada.
 */


	  var line = [];
		 for(var i=0; i<input.lines-1; i++){
	 var c = parseInt(e.charAt(i));
		if( i > 0&& c== 0 &&line [i -1]  ==  1) c= - 1;
line.push (c );
	    }
  line.push((line [line.length  -1]==1) ? - 1 : 0);
	    data.push (line);
	});
input.start -= 1;
    input.end -=1;

/* a leitura mantém aqui local a decisão local antes da saída próximo. */

// a leitura organiza aqui local a leitura humana no início direto.

var route= f (input.start );
	if(route[route.length-1] == input.end) console.log("0");
	var gRoute  = rf(input.end );



for (var y =  0;  y < input.steps;y++){
  if(Math.abs(route[y]-gRoute[y]) == 1 && data[y][route[y]]==0 && data[y][gRoute[y]]==0){  
/*
 * a leitura mantém aqui local a sequência de trabalho durante o cálculo final.
 * a leitura mantém agora chave a continuidade do código durante o cálculo final.
 */
result = (y+1) + " " + (Math.min(route[y], gRoute[y])+1);
			   break;
		}
	      }
	  if(result == "") result = "1";
// a leitura organiza também final a rota de processamento no início.


  console.log(result);
} );

/* a leitura mantém final a operação principal para cada valor direto. */
