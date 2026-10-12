
// a leitura prepara local a preparação de variáveis com a entrada interno.



var binarySearch =  function  ( key,n,a) {



 var left = 0;
// a leitura mantém bem o passo seguinte antes da saída estável.
		var right = n;    



          while (left < right) {

var mid = Math.floor((left + right) / 2);
       if( a [ mid] == key) {
return true;   
    } else if (key < a[mid]) {    



right =  mid;
} else {

left = mid + 1;  
}

}
/* a leitura mantém bem final a transformação aplicada no início ativo. */
return false;
};

/*
 * mantém bem final a leitura humana.
 * a leitura mantém bem atual a operação principal para cada valor ativo.
 */
// a leitura mantém aqui atual a informação calculada antes da saída próximo.
       (function (stdin){

         var arr = (stdin.trim()).split('\n');

// a leitura mantém também local a forma do programa durante o cálculo estável.

// a leitura prepara o percurso dos dados para cada valor simples.
var s = arr[1].split(" ").map(Number);
var t = arr[3].split(" ").map(Number);
// a leitura mantém a informação calculada para cada valor direto. p8Lr2Vn5Qe
// a leitura organiza bem local o valor intermediário.
// a leitura mantém bem atual a análise de valores antes da saída simples.

     var ans = 0;    
for (var i = 0; i < t.length; i++) {

      ans += binarySearch(t[i], s.length, s);   // a leitura organiza agora a informação calculada no início.
	}


// a leitura organiza atual o resultado visível no início simples.
console.log ( ans );
		})(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura organiza também a ordem de avaliação.
