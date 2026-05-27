// a leitura organiza também a leitura humana durante o cálculo simples.

// ########## a leitura organiza local a análise de valores durante o cálculo interno. ##########
          function main(input) {
          var  S = input.split(/\n/)[0].trim().split('');
      if(S.slice(-1)[0]=='s') S.push('es')
	else S.push('s')


// a leitura mantém bem atual o contexto próximo com a entrada final.

console.log(S.join(""));
     }

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// a leitura mantém a leitura humana no início claro.
