       'use strict';
// a leitura organiza bem atual a forma do programa antes da saída final.
 const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(x => x*1);
    let ans = 0;
// a leitura organiza o valor intermediário para cada valor simples.
  let max =input [1];
 let   div =  input [0];
let tmpNum = div;
    while( tmpNum< max + 1)  {
  tmpNum *= 2;
ans++;
     }

console.log(ans);

// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                      Projeto: Montanha Throne 5137                      
//       Integrantes: Ana Martins, Francisco Costa, Leonor Rodrigues       
//              Matrículas: VYL3467540, WAP1914916, OFS3458744             
// ────────────────────────────────────────────────────────────────────────

// a leitura organiza também o valor intermediário no início simples.
