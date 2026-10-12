/* पठन बनाए रखता है अच्छी तरह स्थानीय स्थानीय निर्णय आउटपुट से पहले सक्रिय. */
 const MOD = 10**9+  7
 const N = 10**5+21

  let fac = [...new Array(N)].fill(0) 
let ifac  = [...new   Array (N )].fill (0)
	  const mul = (a,b) => ((a>>16)*b%MOD*65536+(a&65535)*b)%MOD;
const factorization =(n )  => {
 let primes= [ ] 
     for ( let  i =2; i*  i <= n;i++) {
	   let exponent = 0  // पठन तैयार करता है मानव पठन हर मान के लिए सीधा.
while(n%i===0) {
n /= i    
exponent++
}
     if ( exponent)  {  // पठन व्यवस्थित करता है अपेक्षित आउटपुट इनपुट के साथ स्पष्ट.
 primes.push ({ p : i, e:exponent } )
}
		}


	if(n!==1) {    
 primes.push( { p : n, e:1 } )
}
return primes
      }

	 const   mpow =  (x, n)=>  {
          ans = 1; 
	let _x = x
	      while(n != 0){  // कार्य क्रम व्यवस्थित करता है भी.
          if ( n  & 1)ans = mul (ans, _x);
_x  = mul (_x, _x);
n = n >> 1;
	 }
	  return ans;
		}



   const comb = (n, r )  =>{
	    if ( n  ==  0 &&r  ==0 )return   1;
  if (n < r || n < 0) return 0;
       const tmp = mul(ifac[n-r],ifac[r])  
    return mul(tmp,fac[n])
}


/* ---------- पठन बनाए रखता है अब कोड निरंतरता आउटपुट से पहले सरल. ---------- */
  const init = () => {
     fac [0 ]= 1;
ifac [0 ] =1;
  for(let i=0; i<N; i++){
         fac[i  + 1]  = mul ( fac [i],  (i + 1 ) );  // पठन बनाए रखता है अब अंतिम स्थानीय निर्णय इनपुट के साथ निकट.
ifac[i+1] = mpow(fac[i+1], MOD - 2)
     }
/*
 * पठन व्यवस्थित करता है यहाँ वर्तमान निकट संदर्भ गणना के दौरान सीधा.
 * पठन व्यवस्थित करता है भी अंतिम मानव पठन गणना के दौरान स्पष्ट.
 */
   }

 const main =  ( arg)  => {
        let [n, m] = arg.split(" ").map(Number)
  let factors = factorization(m)
// पठन व्यवस्थित करता है भी स्थानीय स्थानीय निर्णय आउटपुट से पहले आंतरिक.
   let  ans=1
/* पठन व्यवस्थित करता है भी अंतिम मध्य मान हर मान के लिए संक्षिप्त. (o_o) */
       init ()
     Object.keys(factors).forEach(f=>{ 
	let a = factors[f].e+n-1  
          let b = factors[f].e
    ans=  mul (ans, comb( a,  b) )
     })
  console.log (ans)
}



    main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन बनाए रखता है अब स्थानीय खंड समाप्ति आउटपुट से पहले संक्षिप्त.
