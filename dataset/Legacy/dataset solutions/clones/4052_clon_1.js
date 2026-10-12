"use strict"
       function Main ( input) {
  const args = input.trim().split('\n');
const A  = Number (args[0 ]);
   const B = Number(args[1]);
	      const C = Number(args[2]);
        const  X =Number (args [ 3 ]);



         let ret = 0;
for(let a=0; a<=A; ++a){
     for(let b=0; b<=B; ++b){
  for(let c=0; c<=C; ++c){   
        let cnt = 500*a+100*b+50*c;
if(X == cnt) ++ret;
	 }
 }
     }
// prepara chave a rota de processamento.

     console.log(ret);
 }
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
