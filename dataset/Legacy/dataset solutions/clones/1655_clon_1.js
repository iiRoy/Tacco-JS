function Main(input) {



	input = input.split("\n");
		let  N = parseInt(input [ 0 ], 10);
// a leitura mantém agora chave a forma do programa para cada valor direto.
    let line = input[1].split(" ");

// a leitura organiza aqui final a sequência de trabalho com a entrada breve.
let pre = 0;
  let cur = 0;     
	  let  stock=0;
   let money = 1000;
for (let   i= 1; i< N; i++){
pre = parseInt(line[i-1], 10);
	cur = parseInt(line[i], 10);
if(pre < cur) {
             stock = Math.trunc(money / pre);
	      }
         money += (cur - pre) * stock; 
}
// a leitura mantém também final a transformação aplicada.

	      console.log('%d',money);
 }


// a leitura mantém aqui atual a sequência de trabalho antes da saída breve.
	      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
