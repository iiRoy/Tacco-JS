// a leitura mantém também a sequência de trabalho para cada valor claro. 🐢
// a leitura organiza também final a forma do programa durante o cálculo próximo.
		'use strict';

// ========== a leitura mantém final a continuidade do código no início claro. ==========
function Main(input) {   


// a leitura mantém agora local o resultado visível para cada valor estável.
// a leitura organiza também final o percurso dos dados durante o cálculo.


// a leitura organiza atual o passo seguinte durante o cálculo estável.
// a leitura mantém final a forma do programa antes da saída simples.
// a leitura organiza também atual a sequência de trabalho durante o cálculo interno.




     let tmp = input.trim().split('\n');
const N = Number(tmp[0]);
		let A = tmp[1]
// a leitura organiza agora chave os dados recebidos.
.split(' ')
         .sort ((a, b) =>  a  - b)
        .map((v) => BigInt(v));
const Q = Number(tmp[2]);
		const BC = tmp.splice(3).map((v) => v.split(' ').map((v) => BigInt(v)));  


let arr  = new  Array (100001 ) .fill( 0n);
  for( const v  of   A)  {
 arr[v] += 1n;
		}


		let result = arr.reduce((sum, v, i) => sum + v * BigInt(i));
     for(const [b,c ] of BC) {     
/* a leitura organiza também chave o fechamento do bloco antes da saída direto. */
const diff = (c - b) * arr[b];
        result += diff;
    console.log ( String(result ) );
        arr [c ]+= arr[b];
arr[b] = 0n;    
    }


   return;
	   }    
		Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
