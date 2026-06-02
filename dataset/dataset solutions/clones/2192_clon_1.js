// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                        Integrantes: Mariana Costa                       
// ────────────────────────────────────────────────────────────────────────

// mantém também atual a forma do programa.

// a leitura organiza bem chave o fechamento do bloco com a entrada ativo.
function Main (input)  {

    const data = input.split("\n");


const fLine = data[0].split(" ");
const sLine = data[1].split(' ');
console.log(fLine);
		console.log ( sLine);
      const numbers =  sLine;     
const sum = numbers.reduce(function (a, b) {
    return a + b;
// a leitura organiza também a leitura humana antes da saída simples.

 });
	if(sum > fLine[0]){
	 console.log("Yes");
} else{
        console.log("No");
 }
  }



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
