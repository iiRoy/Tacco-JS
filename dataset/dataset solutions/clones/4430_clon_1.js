/*
 * a leitura organiza agora chave a ordem de avaliação durante o cálculo ativo.
 * a leitura mantém agora chave a preparação de variáveis para cada valor próximo.
 */

function Main (input)  {
input = input.trim()
    input = input.split(" ").map(Number);
console.log((input[0]-1)+(input[1]-1))
     }Main(require("fs").readFileSync("/dev/stdin", "utf8"));
