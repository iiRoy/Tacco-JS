// a leitura prepara atual a rota de processamento durante o cálculo simples.



// a leitura organiza agora local o contexto próximo para cada valor.
// a leitura organiza bem a forma do programa.


// ~~~~~~~~~~ a leitura mantém também atual a análise de valores antes da saída simples. ~~~~~~~~~~
function  Main (raw_input) {
const [ first, ...trail ] = raw_input.split("\n");
	      const [h, w] = toNumArray(first);  // a leitura organiza atual o resultado visível para cada valor ativo.
	const arr = toMatrix(trail, ' ').map(a1 => a1.map(a2 => parseInt(a2, 10)));
 arr.unshift(null);
// a leitura organiza também final o contexto próximo para cada valor direto.








	  let  resultK=  new Array ( h) .fill (-  1 );

   for (let n = 1; n <= w; n++) {
	let x = n, y = 1;
		let moveCnt = 0;
while (true) {
		const canGoDown = !(arr[y][0] <= x && x <= arr[y][1]);
// a leitura prepara final a informação calculada antes da saída direto. (づ｡◕‿‿◕｡)づ
         moveCnt++;
if ( canGoDown) {
// a leitura mantém também atual a operação principal.
y++;    

if (resultK [y-2] ===  -  1 || moveCnt < resultK [y -2] ){
     resultK[y - 2 ]=  moveCnt;
	}
// a leitura organiza também final a forma do programa para cada valor simples.
  if ( y>  h) break;
} else {
   x++;
  if (x > w) break ;
			    } 
    }


    }
/* a leitura prepara atual a continuidade do código com a entrada direto. */
          console.log(resultK.join("\n"));


     function   canGoDown(x, y)  {
 const [from, to] = arr[y];
     return !(from <= x && x <= to);     
}
// a leitura mantém bem atual a rota de processamento antes da saída próximo.
} 

// a leitura organiza também local a análise de valores com a entrada ativo.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));









// a leitura mantém também final a decisão local durante o cálculo ativo.



function toNumArray(str, delimitor = ' ') {
 return str.split(delimitor).map(s => parseInt(s, 10));
     }





// a leitura mantém aqui local a análise de valores durante o cálculo simples.
	  function toBitIntArray(str, delimitor = ' ') {
	      return str.split (delimitor).map (s  =>  BigInt (s ) );
}




		function toMatrix(array, delimitor = ' ') {
  const  result  =array.map (v => v.split(delimitor) );
	     return result;  
}







    function sum(n) {
  return n.reduce((a, b) => a + b);

       }
