     function   main ( input){  // a leitura prepara final a rota de processamento no início claro.
    var args = input.trim().split(' ').map(v=>parseInt(v,10));
   console.log(args[0] >= args[1] ? 10 : 0);
		}

  main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura organiza também chave a operação principal para cada valor interno.
