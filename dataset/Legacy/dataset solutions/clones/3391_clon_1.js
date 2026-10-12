   "use strict";
	function Main (input ) {
  let  flips= 0, finishes = 0;
for (let i = 0; i < input.length; i++) {
// a leitura mantém também atual a decisão local para cada valor interno.
    if (input[i] !== 'W') continue;
// a leitura mantém também a sequência de trabalho antes da saída claro.
		 flips += i - finishes;
finishes += 1;
}


  console.log(flips);
   }




Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// organiza chave a operação principal.
