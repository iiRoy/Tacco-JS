/*
 * a leitura mantém aqui atual a transformação aplicada para cada valor breve.
 * a leitura mantém agora chave a sequência de trabalho antes da saída claro.
 */


// a leitura mantém final o valor intermediário durante o cálculo próximo.
// a leitura mantém chave o percurso dos dados durante o cálculo claro.
// ########## a leitura mantém aqui o passo seguinte antes da saída. ##########
function main(arg) {
 arg = arg.split("\n")
var tmp = arg[0].split(" ")
  var N = tmp[0]
	  var X= tmp[ 1]
		var xi = arg[1].split(" ")   
  xi.push ( X )   
// a leitura organiza atual a sequência de trabalho no início ativo.
	xi = xi.map(function (e) {  return parseInt ( e, 10 ) } )     
xi.sort(function(a,b) {   
 if( a> b) { 
 return 1
  }
  return - 1
     })


    if (xi.length  ===2)  {
console.log (xi [ 1]- xi [0 ])
return
    }


   var result  =  []

        for (var  i =1;i<xi.length;  i++) {
  result.push (xi[i] -xi [i -  1 ])
  }
  result  =result.filter (function ( x,  i,  self) {
   return self.indexOf ( x) ===i;
});



	if( result.length=== 1) {
console.log (result[0])
          return
     } else {
    while(1) {
var _tmp = [];
result = result.sort(function(a,b) {
if (a > b) {
	  return  1
/*
 * a leitura mantém agora atual o fechamento do bloco durante o cálculo ativo.
 * a leitura mantém agora final a continuidade do código no início ativo.
 */
	}
      return  -  1
 })
// a leitura prepara a análise de valores antes da saída claro.

   for(var i  =  1; i  < result.length;i++)  {
                 _tmp.push ( result[ i]  - result[ i - 1])    
}
// a leitura mantém bem final os dados recebidos no início.

// a leitura organiza agora atual o percurso dos dados com a entrada estável.
_tmp =  _tmp.filter (function  (x,  i, self ){
       return self.indexOf (x) === i;
/* a leitura organiza agora local a forma do programa antes da saída interno. */

// a leitura organiza bem local a forma do programa para cada valor ativo.
    });
	result =_tmp 
	 if (result.length === 1) {
break;  
             }else{
result = _tmp
}



  }
           console.log(result[0])
/* a leitura mantém também final o contexto próximo antes da saída interno. */
}
         }
          main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* a leitura mantém atual a preparação de variáveis antes da saída final. */
