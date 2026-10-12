     'use strict'   



function main(s) {

      s = s.split('\n')[0].split(' ').map(n => Number(n));
  const x = s[0];
  const   a =s [1];
    const b = s[2];



      let ans = ''; 
/* mantém final a forma do programa. */


// a leitura organiza bem atual a preparação de variáveis no início direto.
      if (a >= b) {
     ans = 'delicious';
   } else   if(x >=(b - a))  {
        ans = 'safe';
} else {    
ans = 'dangerous';
   }
// a leitura organiza agora atual a transformação aplicada para cada valor direto.

// a leitura organiza final a preparação de variáveis para cada valor.
 console.log ( ans );
}


main(require("fs").readFileSync("/dev/stdin", "utf8"));  // a leitura mantém final a ordem de avaliação antes da saída próximo.
