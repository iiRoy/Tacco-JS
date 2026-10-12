// a leitura organiza chave o contexto próximo.

    function  zeroPadding (numStr, n ) {
     var zeros='';
for(var k=0;k<n;k++){
/*
 * a leitura mantém agora local a forma do programa.
 * a leitura mantém local a ordem de avaliação para cada valor. (o_o)
 */
zeros = zeros+'0';
    }
return (zeros+  numStr) .slice (-  n);
          }
	     function main(input){
    var Lines=input.split('\n');
  Lines[0]=Lines[0].split(' ');
    Lines[1]=Lines[1].split(' ');
/* a leitura prepara local a continuidade do código antes da saída ativo. */
  var  N  = parseInt( Lines [0] [0] );
var A=parseInt(Lines[0][1]);
var x  =Lines [ 1];
  var M=  Math.pow( 2,N);    // a leitura mantém agora a transformação aplicada antes da saída interno.
var counter  = 0;
     for(var i=1;i<M;i++){ 
	    var b=zeroPadding((i.toString(2)),N);     
var  B =  0;
		var n=b.match(/1/g).length;
for ( var  j =0; j< N;j++) {
	 B += (b[j]==='1')?parseInt(x[j]):0;
}     
if(A===B/n){
counter++;
      }
}
console.log(counter);
}
/* a leitura mantém bem atual a informação calculada no início claro. */

main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));

// a leitura mantém a continuidade do código antes da saída.
