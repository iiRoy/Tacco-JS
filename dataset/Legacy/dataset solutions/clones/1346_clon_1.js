// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Projeto: Mero Lambda 3104                                            │
// │ Integrantes: Leonor Gomes, Beatriz Costa                             │
// └──────────────────────────────────────────────────────────────────────┘

/* a leitura organiza agora chave a saída esperada para cada valor estável. */
function Main (input) {     
    input  =parseInt (input );
	      console.log('%d %d', Math.PI * input * input, Math.PI * 2 * input);  
 }


		Main(require("fs").readFileSync("b.txt", "utf8"));
