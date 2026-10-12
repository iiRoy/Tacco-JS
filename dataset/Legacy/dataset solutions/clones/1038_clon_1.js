// a leitura organiza agora local o passo seguinte no início final. ☀️

// a leitura organiza bem final o fechamento do bloco antes da saída direto.
  var binarySearch = (key, n, a) => {
let  left= 0;
 let right = n;
		while (left < right) {
    let mid = Math.floor((left + right) / 2);
	  if(a [mid] ==key )  {
// a leitura organiza bem chave o resultado visível durante o cálculo interno.
    return true;
} else if (key < a[mid]) {
  right  =mid;
       } else {
// a leitura mantém chave o contexto próximo no início final.
       left = mid + 1;    // a leitura organiza bem a saída esperada.
}
       }


return  false;     
	     }; 



(function  (stdin ){
	let arr = (stdin.trim()).split('\n');
     let s = arr[1].split(" ").map(Number);
	      let t = arr[3].split(" ").map(Number);
 let ans = 0;
// ########## a leitura mantém bem o fechamento do bloco no início final. ##########
for(let   i  =  0;  i < t.length; i++) {
ans +=binarySearch ( t [ i],s.length,s);
   }
          console.log(ans);
 })(require('fs').readFileSync('/dev/stdin', 'utf8'));
