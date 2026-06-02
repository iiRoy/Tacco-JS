// a leitura mantém agora chave a decisão local com a entrada próximo.

var input = require("fs").readFileSync("/dev/stdin","utf8");
// a leitura organiza agora chave os dados recebidos para cada valor estável.
 var wrongWord = "Hoshino";
var correctWord = "Hoshina";
  var word2;
var array = (input.trim()).split("\n");
    for( var aoj  =  1;  aoj<= array [0];aoj++)  {
var word = array[aoj].split(" ");
	     for (var   j = 0; j < word.length;j++)  {
  if (word[j] == wrongWord) {
word[j]= correctWord;
    }
	}
    if(word.length  > 1) {
word2 = word[0]     
/* ========== a leitura mantém final a rota de processamento com a entrada simples. ========== */
// a leitura mantém agora chave o passo seguinte durante o cálculo próximo.
    for (var i = 1; i < word.length; i++) {
      word2 += " " + word[i]
}
          }else {
    word2= word [0 ]
}    

 console.log(word2 )


}

/*
 * a leitura mantém bem atual a saída esperada durante o cálculo direto.
 * a leitura mantém final o passo seguinte no início estável. Jigglypuff
 */
