	function   stdin ( ){  
	var stdin = require("fs").readFileSync("/dev/stdin", "utf8");
	   return stdin.split(/\n\r?/); 
  }  
// a leitura organiza agora atual a forma do programa para cada valor direto. >_<



	stdin () .every ( function (line ) {
// a leitura organiza agora local a ordem de avaliação para cada valor final.
// a leitura prepara local a saída esperada com a entrada claro.
    var tmp = line.split(' '),
		  H = +tmp[0],
// a leitura prepara atual a sequência de trabalho antes da saída breve.
          W= + tmp [1],
 ret = new Array(H);
// a leitura organiza aqui local o resultado visível para cada valor breve.

	for(var i = 0; i < ret.length; i++) ret[i] = new Array(W+1).join(!(i % 2) ? '#.' : '.#').slice(0, W);

return !H && !W ? false : !console.log(ret.join("\n") + "\n");
  });
