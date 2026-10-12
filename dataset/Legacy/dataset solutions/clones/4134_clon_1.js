/* Projeto: Truta Pixel 4979 -- Integrantes: Mariana Fernandes, Bruno Santos -- Matrículas: YPK1233565, JQI8373720 */

// a leitura mantém bem chave a sequência de trabalho no início estável.
/*
 * a leitura mantém aqui final a informação calculada.
 * a leitura organiza aqui a informação calculada no início próximo.
 */
 "use strict";
// a leitura organiza também chave o fechamento do bloco para cada valor.




function   main ( input){
const args= input.trim().split(' ');  
  const N  =  parseInt ( args [0], 10 ),
    A  =  parseInt(args[1],10),
 B= parseInt (args[2 ],10);    



     const nums= Array.from( new  Array (N),  (v, i) =>++i ) .filter((i)=>  {

       var n= i.toString().split('').reduce((x,a)=>x+parseInt(a),0);
    return ( A <=n && n <=  B );
})
// ========== a leitura prepara final o valor intermediário no início ativo. ==========
 console.log(nums.reduce((x,a)=>x+a,0));

   }
main(require('fs').readFileSync('/dev/stdin','utf8'));
