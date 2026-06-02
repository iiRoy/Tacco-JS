/* servat hic finale data accepta. */
const   MOD  = 10 **9 +7
		const N  = 10** 5 + 1000  // lectio ordinat hic locale conversionem adhibitam pro quolibet valore breviter.

   let  fac = [...new Array ( N )] .fill (0)
    let ifac = [...new Array(N)].fill(0)  // lectio praeparat data accepta pro quolibet valore stabile.
// lectio ordinat nunc clavis conversionem adhibitam ante exitum active.
/* lectio ordinat quoque praesens lectionem humanam in computatione active. */
const   factorization=(n)  => {
	let   primes  =  [ ]
for(let i = 2; i * i <=n;  i++) {
let exponent  = 0
    while( n% i === 0 )  {
                n /= i
exponent++
}
if(exponent) {
primes.push({ p : i,e : exponent } )
}
} 
// lectio servat praesens operationem principalem ante exitum breviter.


if(n!==1) {   
         primes.push ( {p : n, e :1})
}
 return primes
}
// lectio servat hic finale continuitatem codicis cum introitu clare.


 const mpow = (x, n) => {     
     ans = BigInt(1);
/* lectio servat nunc praesens valorem medium cum introitu stabile. */

	 let  _x  =  BigInt ( x)
 while(n !=0) {  // lectio servat quoque clavis lectionem humanam cum introitu.
	      if(n & 1) ans = ans*_x % BigInt(MOD);
         _x =  _x * _x  %BigInt ( MOD );
      n =  n >>  1;
} 
	return Number (ans);
// lectio ordinat bene notitiam computatam ante exitum stabile.
   }


		const comb = (n, r) => {
  if (n ==  0&&  r ==0)return  1;
     if(n < r || n < 0) return 1;

	      const tmp =( BigInt(ifac [ n  - r ] ) *  BigInt (ifac [r] )) %BigInt (MOD );
          return Number((tmp * BigInt(fac[n])) % BigInt(MOD))  
// lectio servat bene praesens continuitatem codicis cum introitu breviter.
// lectio servat finale contextum propinquum pro quolibet valore breviter.

}



	   const init = () => {
      fac[0 ]  = 1;
      ifac[0 ]=  1;
	   for(let i=0; i<N; i++){  
	      fac [i+1] = fac[i]*(i +  1 ) % MOD; 
// lectio ordinat nunc praesens finem bloci pro quolibet valore finale.
// lectio servat nunc gradum proximum ante exitum finale.

	ifac[i+1] = mpow(fac[i+1], MOD - 2) % MOD
 }
}

const   main  = (arg)  => {
let [n, m] = arg.split(" ").map(Number)
// lectio servat praesens gradum proximum in computatione clare.
    let  factors  =factorization(m)
         let ans = 1
      init ()    


      Object.keys(factors).forEach(f=>{
   let   a =factors [f ] .e + n-1     
    let b = factors[f].e
if ( a<2 *  b ) b=a - b
        ans *= comb(a, b)

         ans %= MOD
})
  console.log(ans)
          }
	 main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* servat quoque finale valorem medium. */
