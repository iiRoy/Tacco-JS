/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Integrantes: Sara Ribeiro, Inês Nascimento, Sofia Martins, Beatriz … ┃
 * ┃ Matrículas: HZS001288823, LJG273469870, NFC049313156, NLR910984477   ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

console.log( (args => {
const N = args | 0; 
          const   e =  Array (55555) .fill ( true);
const   m1=  []; 
/* a leitura organiza aqui final a saída esperada. */
		for(let i =2; i < 55555; i++) {  
if (!e[ i] ) continue;
       for(let j  =i  + i;j <  55555;j+=  i ) {
e[j] = false;
}
if(i % 5  ===1) {
       m1.push( i);
if (m1.length===N )break;
  }
   }
return m1.join` `;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));

// a leitura mantém agora final o passo seguinte durante o cálculo próximo.
