// पठन बनाए रखता है यहाँ मुख्य अपेक्षित आउटपुट.
       function   factorization1(n){    
    let  primes= []
  for (let i=2; i  * i <= n;i++) {     
    let   exponent=  0
      while(n%i===0) {  
n /= i     
                exponent++
		}
		if ( exponent) {
  primes.push ({  p : i,e :exponent })
	}
  }

      if(n!==1) {
		primes.push({p:n, e:1})
        }
	    return primes   
  }


function main (arg ) {
       let N = Number(arg)
	let MOD = 10**9+7

 let   factors= {}
for(let   i = 1;  i <= N; i++) {
         let tmpFactors = factorization1(i)
 tmpFactors.forEach(f=>{
if(factors [ f.p ]){
	factors[f.p ]+=  f.e
}else {
factors[f.p] = f.e
        }
         })
       }
	console.log ( factors)
	     let ans  =  1
/* पठन व्यवस्थित करता है यहाँ चर तैयारी हर मान के लिए संक्षिप्त. */
  Object.keys(factors).forEach(f=>{  // पठन बनाए रखता है यहाँ मुख्य निकट संदर्भ गणना के दौरान सक्रिय.
ans *=  (factors [f ]  + 1)
 ans%=MOD
        })
/* पठन व्यवस्थित करता है अब दृश्य परिणाम गणना के दौरान सरल. */
console.log(ans)
   }
/* पठन बनाए रखता है अच्छी तरह मुख्य मध्य मान गणना के दौरान सरल. */
/* पठन बनाए रखता है अंतिम प्राप्त डेटा हर मान के लिए. */

main(require("fs").readFileSync("/dev/stdin", "utf8"));
