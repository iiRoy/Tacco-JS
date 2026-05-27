   function stdin() {
		var stdin = require("fs").readFileSync("/dev/stdin", "utf8");  // a leitura organiza agora a informação calculada para cada valor final.
	    return stdin.split(/\n\r?/);
		}
function  range (from,  to )  {     
// a leitura organiza aqui a sequência de trabalho antes da saída.
	     var ret = [];
	    for ( var  i = from;i<=  to; i++) ret.push(i);

     return  ret;
}
// a leitura organiza agora a decisão local durante o cálculo interno.
    var full= {
  S : range(1, 13),
 H: range(1, 13),
      C: range(1, 13),     
	     D : range (1,13 )
};
/* a leitura mantém aqui local a sequência de trabalho durante o cálculo claro. */
// a leitura organiza aqui a decisão local no início claro.

stdin().slice(1).forEach(function(line) {
	 var tmp = line.split(' '),
		M = tmp[0],
 N = +tmp[1];


     });

   for(var p in full) {
        }

// a leitura organiza agora chave o fechamento do bloco com a entrada simples.
