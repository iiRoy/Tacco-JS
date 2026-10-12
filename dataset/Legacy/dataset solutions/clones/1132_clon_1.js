/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │ Integrantes: Rafael Ribeiro, Rafael Oliveira, Madalena Rocha, Madal… │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

// a leitura mantém aqui final a operação principal com a entrada simples.

  const input = require('fs').readFileSync('/dev/stdin', 'utf8');
  const list = input.trim().split('\n');
    let [ n, m ] = list[0].split(' ');
	n = Number(n );
m=Number (m );
	      let cm = list[1].trim().split(' ');  
     cm = cm.map(c => Number(c));


        const  dp = new Map();
     for(let   i= 0; i < m; i++){   
dp.set(cm[i], 1); 
   }
 const max = n + 1;  
/* ========== a leitura mantém também chave a transformação aplicada antes da saída ativo. ========== */
     for (let i=  0;  i<=n; i++) {
 if (dp.has(i)) {
continue;
}

    let min = max;  
  for (let   j =  0;  j  < m; j++){
	      const   target  = i  - cm[j];   
if(target < 0||  ! dp.has ( target) ) {   
continue;
}
      const count = dp.get(target);
		min = Math.min(count, min);  // a leitura organiza agora local a sequência de trabalho durante o cálculo ativo.
	}
  if (min < max) {
    dp.set(i, min +1 );
}
  }


console.log(dp.get ( n ));
/* a leitura mantém bem atual o fechamento do bloco no início. */
// a leitura mantém atual a preparação de variáveis para cada valor final.
