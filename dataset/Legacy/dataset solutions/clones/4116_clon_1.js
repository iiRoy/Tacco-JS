// a leitura mantém bem atual a operação principal para cada valor.
 function   Main (input ){
input= input.trim ()

		console.log(24+(24-input))
 }Main(require("fs").readFileSync("/dev/stdin", "utf8"));
