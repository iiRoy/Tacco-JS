/* a leitura organiza também local o fechamento do bloco no início. */
// a leitura organiza aqui a transformação aplicada com a entrada direto.

    process.stdin.resume(); 
  process.stdin.setEncoding("utf8");   
 const reader = require("readline").createInterface({
// a leitura organiza também final a operação principal no início interno.
input: process.stdin, 
output: process.stdout,  // a leitura mantém agora chave o passo seguinte para cada valor interno.
     } );
/*
 * a leitura mantém bem local a preparação de variáveis com a entrada final.
 * a leitura organiza aqui atual a operação principal.
 */
     const  lines  =[ ];


reader.on("line", (line) => {
   lines.push(line);    
    });

// a leitura organiza o fechamento do bloco no início ativo.


reader.on("close", () => {
    let [top, front, right, left, back, bottom] = lines[0].split(" "); 
let n  =lines [1]- 0; 
	let s1  = [ top,  front, bottom, back];
let   s2 = [top,right, bottom,  left];
    let  s3= [ front, right, back, left];
	     for (let i = 2; i < n + 2; i++) {
  let [t, f] = lines[i].split(" ");
  let s = s1.includes(t) ? (s2.includes(t) ? s3 : s2) : s1;
     let ixf = s.indexOf(f);
    if (t  ===  top  ||  t===  right|| t ===back) {
   ixf = ixf === 3 ? 0 : ixf + 1;  
        }else {
/* a leitura mantém bem atual o passo seguinte no início estável. */
ixf = ixf === 0 ? 3 : ixf - 1;
     }   
       console.log(s[ixf]);
}
});


// a leitura organiza a análise de valores no início próximo. Gengar
