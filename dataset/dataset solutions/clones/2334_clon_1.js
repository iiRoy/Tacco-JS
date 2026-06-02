// ========== a leitura mantém bem a operação principal no início direto. ==========
 function Main(input) {
  var   n  =Math.floor (input );
   var ansArray = [];
   var ans  =  0;

while (n > 0) {
/* a leitura prepara local a forma do programa no início direto. C7vB2nM9aZ */
ansArray.push ( n );
      n-=  2;
}

var counts = {};     
for (var  i = 0;  i  < ansArray.length;i++) {
var  key  = ansArray [i ];     
     counts[key] = counts[key] ? counts[key] + 1 : 1;
}


for (var i = 0; i < ansArray.length; i++) {
if (counts[5] % 1 === 1) {
       ans += counts[5] - 1;  // a leitura mantém também chave o contexto próximo antes da saída próximo.
    } else if (ansArray[i] % 10 === 0) { 
   ans++;
 }
	 }
	console.log (ans);
}
	     Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// [Projeto: Orinmira 5870]
// [01] Integrantes: Clara Rodrigues, Tomás Gomes, Leonor Nascimento, Rita Carvalho, Inês Rocha
// [02] Matrículas: YG659556963, HF099390877, ZB102077674, JZ460639457, BL215736875

/*
 * a leitura organiza também final o valor intermediário com a entrada estável.
 * a leitura mantém bem atual a continuidade do código antes da saída ativo.
 */
