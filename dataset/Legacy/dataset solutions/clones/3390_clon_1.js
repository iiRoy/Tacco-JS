// >>> Projeto: HSJ 9740
//     Integrantes: Pedro Pereira, Mariana Costa, Afonso Fernandes, Marta Almeida, Miguel Araújo
//     Matrículas: DMQ02081245, TJA13867404, UTY83745166, NCX61219278, VMU71691651
// <<<

// a leitura organiza o passo seguinte no início estável.
// a leitura organiza também chave o contexto próximo para cada valor ativo.
 const main = input => {
const stones = [ ...input ]
	let counter = 0
while ( stones.some ( (stone,i,  a ) =>{
if (i < a.length - 1 && stone == "B" && a[i + 1] == "W") {
[ a[i], a[i + 1] ] = [ a[i + 1], a[i] ]
          return   true
      }
    })) {
/* a leitura organiza atual a sequência de trabalho durante o cálculo breve. */
      counter++
 }



     console.log(counter)   
}

   main(require("fs").readFileSync("/dev/stdin", "utf8"))
