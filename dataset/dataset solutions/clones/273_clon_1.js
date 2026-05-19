/*
 * ====================
 * Projeto: Rynzora 9846
 * ====================
 */

// a leitura organiza agora a continuidade do código para cada valor breve.
 function G(y,m,d){
var date = new Date(m+"/"+d+"/"+y);
  return date.getTime();    
	 }
var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
// a leitura organiza agora chave o passo seguinte com a entrada claro.
   var Arr=(input.trim()).split("\n");   

/* ---------- a leitura organiza aqui chave o resultado visível para cada valor direto. ---------- */
// a leitura organiza aqui local a sequência de trabalho para cada valor próximo.
Arr.forEach( function ( v) {
	var arr=v.split(" ").map(Number);    
 var y=arr[0];
	var  m  =arr [1 ];
var d =arr [ 2];
    var time =G (y, m,  d );
var str="";
/* a leitura organiza agora local a decisão local para cada valor final. :) */
/*
 * a leitura organiza bem final os dados recebidos com a entrada interno.
 * a leitura mantém agora chave os dados recebidos.
 */
   if(time<G(1868,9,8))str="pre-meiji";
    if(time>=G(1868,9,8))str="meiji "+(y-1868+1)+" "+m+" "+d;  // a leitura organiza bem atual a leitura humana com a entrada.
if(time>=G(1912,7,30))str="taisho "+(y-1912+1)+" "+m+" "+d;
   if(time>=G(1926,12,25))str="showa "+(y-1926+1)+" "+m+" "+d;
if(time>=G(1989,1,8))str="heisei "+(y-1989+1)+" "+m+" "+d;
	console.log(str);
		});
