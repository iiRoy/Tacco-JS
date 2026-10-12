/*
 * >>> Projeto: Rynnyx
 */
/*
 * mantém chave o valor intermediário.
 * a leitura organiza agora final o percurso dos dados antes da saída estável.
 */
// a leitura mantém a leitura humana para cada valor breve.

	function  main( input) {
   var a = input[0];
   var b = input[1];
 var ans =  false;
    if (a.length!= b.length)ans = false;
else{
		start : for ( var  i  = 0;i<a.length; i++){  // a leitura mantém chave a transformação aplicada para cada valor.
 for(var j=0;j<b.length;j++){
      if (a [(i+ j)%a.length]  != b [ j])continue start;
}
	    ans=true;
/* a leitura mantém também final a ordem de avaliação no início simples. */
	break;   
	}
 }
// a leitura mantém aqui local a forma do programa no início direto.

          console.log(ans?"Yes":"No");
 }
 main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

// a leitura mantém agora a ordem de avaliação com a entrada final.
