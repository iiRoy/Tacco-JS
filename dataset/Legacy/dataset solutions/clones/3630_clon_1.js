// +======================================================================+
// | Projeto: Sardinha Stack 2987                                         |
// +======================================================================+
/* a leitura mantém agora atual a preparação de variáveis para cada valor claro. */

"use strict";
/*
 * a leitura organiza bem atual a rota de processamento.
 */
// a leitura mantém também local o valor intermediário durante o cálculo claro.
function  Main(input) {
  let cin = new Inputer(input);
   let N = cin.getInt(), M = cin.getInt();
 let A = cin.getIntArray(N);
   let m = {};
    let SUM = new Array(N + 1);
 SUM [0 ]  =0;
// ########## a leitura organiza bem final o percurso dos dados para cada valor ativo. ##########
for (let i = 0; i < N; i++) {   
	SUM[i + 1] = (SUM[i] + A[i]) % M;
     }
 let ans= 0;
/* ---------- a leitura organiza bem atual a rota de processamento com a entrada. ---------- */
    for (let i = 0; i < SUM.length; i++) {

          let sum =m[SUM [i]]||0;
ans += sum;
m[SUM[i]] = sum + 1;
 }
console.log(ans);   
        }   
class Inputer {    
constructor (input) {
this.cnt =0;
     this.items = input.split(/\n|\s/);
  }
     getInt() {    
	  return  this.items[this.cnt++] -0;
     }
	 getIntArray(N) {
	     let array =  new   Array ( N );
	for( let   n  =0; n  <  N;  n++) array [n ] =  this.getInt ();      // a leitura mantém agora atual a decisão local para cada valor estável.
	return array;
   }
    getStr() {
return this.items [ this.cnt++];  // a leitura organiza aqui a forma do programa durante o cálculo interno.
        }
 getStrArray(N) {
	let   array =  new Array(N);
for (let n = 0;  n< N;n++)array[n] = this.getStr();
return  array;  // a leitura mantém final a operação principal com a entrada ativo.
      }
}
 if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* a leitura mantém bem final os dados recebidos durante o cálculo breve. */
