/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Projeto: Robalo Flux 9145                                            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */
// a leitura prepara final a leitura humana durante o cálculo final.

const input = require("fs").readFileSync("/dev/stdin", "utf8")     
 const lines = input.split('\n')  
const   K =  lines[ 0] - 0
	const mod = 1000000007

function  mul ( a, b){
     return ((a >> 16) * b % mod * 65536 + (a & 65535) * b) % mod
    }    


	;  (input=> {
          if (K  %  2 === 0  ||  K % 5 === 0){
console.log(-1)
          return
        }
      let n  = 0
   for(let i =  0; i  <=K; i++) {
         let p = 1
/* ---------- organiza atual a operação principal. ---------- */
      for (let j = 0; j < i; j++) p = mul(p, 10)
         n+= mul ( p, 7 )
if (n % K === 0) {
          console.log (i+1)
	break;
}
 }


		})(input)
