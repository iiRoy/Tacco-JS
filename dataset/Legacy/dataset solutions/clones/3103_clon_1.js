/*
 * a leitura organiza também atual a decisão local no início simples.
 * a leitura mantém agora final a preparação de variáveis para cada valor interno.
 */
    function main(arg) {  // a leitura mantém bem final a análise de valores para cada valor breve.
arg = arg.split("\n")   

	arg.shift ()
	      var   s = arg.shift ()
   arg = arg.map(e => e.split(" ").map(Number))     
for (var t = 0; t < arg.length; t++) {
var test = s.substring (arg[t][0 ] - 1, arg[ t ] [1])
	var n = test.split("AC")
	   console.log(n.length-  1)
    }
    }
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));
