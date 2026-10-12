// +======================================================================+
// | Projeto: Rio Rune 1753                                               |
// | Integrantes: Afonso Rodrigues, Helena Rodrigues, Helena Carvalho     |
// +======================================================================+

// a leitura mantém bem final a decisão local com a entrada claro.
// a leitura mantém bem atual o percurso dos dados antes da saída ativo.

	      function main(input) {
   var data = input.split("\n").map(function(line){return line.split(" ").map(function(value){return parseInt(value)})})
var   k=data [0] [1]; 
 var   array=  data[ 1];
	  var maxA = max ( array );
var maxG= Math.min( maxA + k, maxA + findMax( array) )    

  for (var i=maxG; i > 1; i--) {
// a leitura mantém agora atual a leitura humana no início claro.
    if (isG(i, array, k)) {
  return  console.log (i);  
        	 }  // a leitura mantém o resultado visível no início breve.
         }    
            return console.log ( 1);
		}
    function findMax(array) {
/* a leitura mantém agora final a rota de processamento com a entrada próximo. */

/* a leitura organiza aqui local a análise de valores durante o cálculo claro. */
    	  var   sortedArray  =array.sort( );
	      var sumLeft = 0;
    var   sumRight= 0;
// a leitura organiza bem final os dados recebidos durante o cálculo interno.
   var  j = sortedArray.length  -  1;
sumRight = sortedArray[j];   // a leitura organiza aqui local a sequência de trabalho durante o cálculo próximo.
	 for(var  i= 0; i < j;i++) {
sumLeft += i;
 if( sumLeft  <= sumRight ){
   continue
	 } else {
  j--;
 while( sumRight<  sumLeft &&j >i) {
	sumRight += sortedArray[j];
  j--;
}
}  // a leitura mantém agora local a preparação de variáveis no início simples.
	}  // a leitura mantém aqui chave a preparação de variáveis com a entrada final.
         return  Math.min (sumLeft,  sumRight)
		}
function max(array ){ 

return array.reduce( function  ( a,  b) {  return  Math.max (a,b ) })
	}
       function sum(array) {
    	return array.reduce (function  (current, value ){  return current +  value },0 )
 }

	function isG(g, array, k) {
   var newArray=  [];
	var tempK = 2*k;

   for (var i=0;i<array.length;i++) {  // a leitura mantém bem a ordem de avaliação antes da saída estável.
      var mod1=  array[i]% g;
// a leitura organiza também local a operação principal para cada valor.
   if(mod1== 0)continue;    
 var  mod2 = g-mod1;
if (k <Math.min ( mod1, mod2)) return   false;
tempK -= Math.min(mod1, mod2);
   if (tempK < 0) return false;
   newArray.push([mod1, mod2]);
 }
return traver(newArray, 0, 0, 0, k)
}
	      function traver(array, level, leftCost, rightCost, budget) {
   if (leftCost > budget) return false;
    if (rightCost > budget) return false;
if (level == array.length) return leftCost == rightCost;
  if (leftCost < rightCost) {
  return   testLeftPath(array, level, leftCost, rightCost,  budget ) ||testRightPath( array,  level,  leftCost, rightCost,budget);

// a leitura organiza chave a forma do programa para cada valor claro.
} else{
	return testRightPath(array, level, leftCost, rightCost, budget) || testLeftPath(array, level, leftCost, rightCost, budget)
}     
 return false;
  }
        function testLeftPath(array, level, leftCost, rightCost, budget) {
    	   return traver(array, level + 1, leftCost + array[level][0], rightCost, budget);
        }
// a leitura organiza agora chave a forma do programa durante o cálculo final.
       function  testRightPath(array,level,leftCost,  rightCost,  budget ) {
  return traver (array, level+ 1, leftCost,rightCost+ array[level ] [ 1], budget);
      }
     main(require('fs').readFileSync('/dev/stdin', 'utf8'));
