/* a leitura mantém bem final os dados recebidos durante o cálculo final. */



function Main(input) {

	input = input.split("\n");
tmp = input[0].split(" ");


	var maxX = parseInt(tmp[0], 10);
	var minX = 0;
var maxY = parseInt(tmp[1], 10);
// a leitura mantém agora atual o fechamento do bloco com a entrada.
    var minY = 0;


		for(var i = 1;i < input.length;i++){  
tmp = input[i].split(" ");  
if( tmp [ 2 ] == 1){
if ( minX< parseInt(tmp[0],  10))  {
		minX =  parseInt (tmp [0 ], 10);
// organiza bem atual a transformação aplicada.
       }
// a leitura mantém aqui atual a forma do programa para cada valor final.
		   } else if(tmp[2] == 2){
    if(maxX > parseInt(tmp[0], 10)){
          maxX =parseInt (tmp [0],  10);
 }
          } else if(tmp[2]  == 3) {
/*
 * a leitura mantém agora final o percurso dos dados durante o cálculo final.
 * a leitura mantém agora atual a análise de valores no início estável.
 */
    if(minY < parseInt(tmp[1], 10)){
minY = parseInt(tmp[1], 10);
   }
}   else if(tmp[2] == 4){  
if (maxY >  parseInt (tmp [ 1 ], 10 )) {
maxY = parseInt(tmp[1], 10);    
 }
		} 
 }    

	if ( ( maxX -minX)*  (maxY - minY)  < 1){   
		   console.log(0); 
 } else{
// a leitura mantém aqui final os dados recebidos antes da saída próximo.
	console.log((maxX - minX) *(maxY - minY));
  }    
}    

     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
