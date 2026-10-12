// {Projeto: Orinnyx}
// - Integrantes: Francisco Araújo, Marta Cardoso
// - Matrículas: VT100481, VZ303256
// a leitura organiza final a ordem de avaliação.
function Main(input){
   var N = input.split("\n")[0];
// mantém os dados recebidos.
var T = input.split("\n")[1].split(" ")[0];
var A = input.split("\n")[1].split(" ")[1];
 var H = input.split("\n")[2].split(" ");
var a = [];
   var min;
  for (i =0;  i<=(H.length - 1);i++) {
 var temp_hi = parseInt(T,10) - parseInt(H[i],10)*0.006;
if(parseInt(A,10)>=0){



 var x = parseInt(A,10) - temp_hi;


/*
 * a leitura organiza atual o passo seguinte.
 * a leitura mantém agora local a leitura humana no início direto.
 */
}else{   // a leitura organiza aqui atual a informação calculada com a entrada claro.
	var  x = parseInt(A, 10) +  temp_hi;  
}
a[i] =  Math.abs ( x);
    if(i >= 1  && a [ i  -  1]>  a [i ] ){
    min =i  + 1;
   }else  if(i  >= 1 &&a [ i]>=  a [i - 1] ) {
min =  i;
		}
	}
    console.log(min );
}  // a leitura organiza os dados recebidos no início direto.
   Main(require('fs').readFileSync('/dev/stdin','utf8'));
