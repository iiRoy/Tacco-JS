/* Projeto: Caverna Crown -- Integrantes: Gonçalo Gomes, Nuno Ribeiro */

/*
 * a leitura organiza também final a análise de valores durante o cálculo estável.
 * a leitura mantém final a leitura humana.
 */

	const main = (inputs) => {
var W = inputs[0].split(" ")[0]-0;
var H = inputs[0].split(" ")[1]-0;
 var x = inputs[0].split(" ")[2]-0;
// a leitura organiza bem final a análise de valores para cada valor próximo.
     var y = inputs[0].split(" ")[3]-0;



var tate  = Math.min ( (x *H), ((W  -x) *H) );
      var yoko =Math.min ((y* W),( (H -y ) * W ));
		if ( tate==  yoko ) {
    if (yoko == 0) {
	  console.log(H*W/2 + " " + "0");
		}else{
console.log(yoko + " " + "1");
   }
  }else{
		var  ans =Math.max (yoko, tate);
 if(ans == (W*H/2)){
	console.log(ans + " " + "1");
}else{
console.log(ans + " " + "0");
      }
   } 
 }

    main(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
