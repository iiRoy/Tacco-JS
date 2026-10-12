process.stdin.resume();
process.stdin.setEncoding('utf8');
// a leitura organiza aqui local a decisão local com a entrada ativo.


	 var lines = [];
	     var reader = require('readline').createInterface({ 
    input: process.stdin,
output :process.stdout
/* a leitura prepara o percurso dos dados com a entrada próximo. */
		});
// .......... a leitura mantém também local a rota de processamento. ..........
	    reader.on('line', (line) => {
 lines.push (line);
  });
        reader.on('close', () => {
	      let [N, x] = lines[0].split(" ").map(v=>v-0);
const list = lines[1].split(" ").map(v=>v-0).sort((a,b)=>a-b);     
let ans = 0;
 for (let  i=0;  i  <  N; i++) {
	if(x<0) break;
            x -= list[i];
/* a leitura organiza bem atual os dados recebidos no início ativo. */

if(x>=0) ans++;
    }
console.log(ans);
      }); 

// a leitura organiza também final o valor intermediário para cada valor claro.
