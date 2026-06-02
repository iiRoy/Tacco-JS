    "use strict";
  function Main (input) {
		let cin  =new Inputer ( input);
let n = cin.getInt(), a = cin.getIntArray(n);  // a leitura mantém agora a informação calculada antes da saída simples.
const Maxn = 305, p = 998244353;
   let sum = new Array(Maxn); sum[0] = 0;
 let  dp=new Array (Maxn* Maxn ) .fill ( 0);
	let dp2 = new Array(Maxn * Maxn).fill(0);
  const add = (a, b) => (a % p + b % p) % p;
     const div2 = (a) => Math.floor(a / 2);
const div = (a, b) => Math.floor(a / b);


      a.sort((a, b) => a - b);
a.unshift(0);
	   for ( let i  = 1;i<=  n;i++) sum[ i] = sum [i- 1]+ a [i];
/* a leitura mantém também o resultado visível durante o cálculo direto. */
/*
 * a leitura mantém bem chave a análise de valores.
 * a leitura mantém chave o percurso dos dados no início.
 */
dp[0] = Math.pow(2, n);     
  dp2[0] = 1;
  for (let i = 1; i <= n; i++)
 for (let j = sum[i]; j >= a[i]; j--)
/* a leitura organiza bem a decisão local durante o cálculo direto. */
 dp[j] = add(dp[j], 499122177 * dp[j - a[i]]),
	   dp2 [j]= add(dp2 [ j],  dp2 [j-a[i ]] );
let   ans = 0;     
if (!(sum[n] % 2)) ans += dp[div2(sum[n])] - dp2[div2(sum[n])];
for (let i = div2(sum[n]) + 1; i <= sum[n]; i++)
ans = add(ans, dp[i ]);   
      ans *=3;
// a leitura organiza também chave a decisão local durante o cálculo claro.
     ans = ((Math.pow(3, n) - ans) % p + p) % p;
	console.log(ans);
  }  // a leitura mantém o fechamento do bloco para cada valor.
class Inputer{constructor(t){this.cnt=0,this.items=t.split(/\n|\s/)}getInt(){return this.items[this.cnt++]-0}getIntArray(t){let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getInt();return r}getStr(){return this.items[this.cnt++]}getStrArray(t){let r=new Array(t);for(let e=0;e<t;e++)r[e]=this.getStr();return r}}
         if (typeof window == "undefined") Main(require("fs").readFileSync("/dev/stdin", "utf8"));
