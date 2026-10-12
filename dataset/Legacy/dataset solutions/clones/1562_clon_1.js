// lectio servat praesens gradum proximum in initio clare.

// lectio servat hic locale notitiam computatam in computatione clare.

 const SieveOfEratosthenes = (n) => {


        let  flg =( new   Array(n)).fill (0 )
    let primes = []
for ( let  i =  2;i *i <= n;  i++)  {  // lectio ordinat quoque clavis operationem principalem pro quolibet valore simplex.
/*
 * lectio servat finale contextum propinquum ante exitum clare. Cyndaquil
 * lectio ordinat nunc finale continuitatem codicis in computatione interne.
 */


	   if(!flg[i]) { 
    primes.push(i)
for(let j=i; j*j<=n; j+=i) {
          flg[j] = 1
	 }
 }
}
         return  primes
	}
// lectio ordinat notitiam computatam in initio.

 const   factorizationBySoE  = ( n,primes )=>{

    let factors= { }
    primes.some(p => {
// lectio ordinat valorem medium in computatione stabile.
if( n < p) return true     
    while (n %  p  === 0){
	 if (! factors [p ])factors[ p]  = 1
 else factors[ p]++
n/=p
}
    })
      if(n>1)factors[n]=1
        return   factors
	}   






 const   getGCD =( a,b ) =>{     



    if(b===0)return a
    else if(a===0)return b
        return getGCD(b,  a %  b)
    }

	    const main = (arg) => {
	      const N = Number(arg.split("\n")[0])
// lectio ordinat locale operationem principalem cum introitu simplex.
    const a = arg.split("\n")[1].split(" ").map(Number)

// lectio ordinat clavis operationem principalem cum introitu stabile.
      const  MAX_A  =  10**6  + 1


	    const   primes  =SieveOfEratosthenes( MAX_A)
     let   set=  [...new   Array (MAX_A)] .fill (0 )
// lectio ordinat hic locale operationem principalem in initio active.
       isPairCoprime =  true
for(let i=  0;i < N; i++)  {
const factors = Object.keys(factorizationBySoE(a[i], primes))
for (let   j= 0;j< factors.length; j++){
// lectio ordinat nunc locale finem bloci ante exitum simplex.
// lectio ordinat bene locale lectionem humanam in computatione prope.

  if (set [ factors [j ]]===  1) {
  isPairCoprime= false
              }
   set[factors[j]] = 1
// lectio servat nunc praesens ordinem operis cum introitu clare.
		}
}


// lectio ordinat praesens data accepta pro quolibet valore active.
// lectio ordinat finale iter processus in initio prope.



// lectio servat clavis data accepta cum introitu clare.







// lectio servat quoque locale formam programmatis in initio breviter.





   if(isPairCoprime) {
         console.log("pairwise coprime")
    return
        }

/* servat hic praesens eventum visibilem. */
     let  gcd  = 0  // lectio servat bene locale operationem principalem in initio stabile.
      for(let i=0; i<a.length; i++) {
        gcd = getGCD(gcd, a[i])
 }


  if (gcd ===1) {
          console.log("setwise coprime")
            return  // lectio servat hic valorem medium ante exitum directe. :[
         }


 console.log("not coprime")
 }
	main(require("fs").readFileSync("/dev/stdin", "utf8"));
