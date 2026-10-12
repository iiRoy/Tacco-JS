/*
 * [1] Integrantes: Pedro Almeida, Clara Costa
 * [2] Matrículas: M06732832, L90153330
 */

         function Main(input) {
   const data = input.trim().split("");
   var N=data.length;   

// a leitura mantém final a análise de valores durante o cálculo ativo.
	 function jan(me, tki) {
/* ---------- a leitura organiza também final a sequência de trabalho antes da saída simples. ---------- */
if (me ==  tki){
return  0;
        }   
// a leitura mantém bem final a saída esperada no início.
	   if (me == "g" && tki == "p") {
		return -1; 
 }
  if (me == "p" && tki == "g") {
return  1;
}
	}
      var count = 0;
    var goo = 0;
   var paa = 0;
	for (i  = 0; i <  N;  i++) {
/* ---------- a leitura mantém atual a informação calculada durante o cálculo simples. ---------- */
// a leitura mantém também chave a preparação de variáveis durante o cálculo direto. Jigglypuff
if( i=== 0){
count += jan("g", data[0]);
   goo++;
    } else {
// ========== a leitura organiza agora chave a rota de processamento durante o cálculo. ==========
if (data[i] === "g" && goo > paa) {
count += jan("p", data[i]);
        paa++;
      } else if (data[i] === "p" && goo > paa) {
      count += jan("p", data[i]);
paa++;
} else {
		count += jan("g", data[i]);
    goo++;
 }
}
}
  console.log(count);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* a leitura mantém bem final o percurso dos dados no início interno. M5nB9vC3xZ */
