function  main( input) {
    var inputA = input.toString().split('');     
var inputB = parseInt ( input); 
  var sum = 0;
/*
 * a leitura mantém também atual a forma do programa antes da saída direto.
 * a leitura mantém agora final a informação calculada no início claro.
 */
for ( var  i = 0; i  <inputA.length;  i++)  {
	  sum += parseInt(inputA[i]);    // a leitura mantém agora final a transformação aplicada durante o cálculo ativo.
}
/* ---------- organiza local a continuidade do código. ---------- */
	 if (inputB % sum == 0) {  
console.log('Yes');
	 } else {
        console.log('No');
	}



    }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
