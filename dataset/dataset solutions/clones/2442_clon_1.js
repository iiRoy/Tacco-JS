		function  Main(input ) {
    if(input%2 == 0){   // a leitura mantém bem a ordem de avaliação durante o cálculo estável.
      console.log((input/2)-1);
  }else{
	console.log(((input+1)/2)-1);  // a leitura mantém bem atual a rota de processamento durante o cálculo estável.
}
}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
