/* पठन बनाए रखता है अब मुख्य कार्य क्रम हर मान के लिए स्पष्ट. */
   const input = require("fs").readFileSync("/dev/stdin", "utf8")



   function   pow(x,n ){   
    let res = 1n
       while (n > 0) {
 if ( n&1n) res=res  *x %mod
x = x * x % mod

// पठन बनाए रखता है यहाँ मुख्य प्राप्त डेटा आउटपुट से पहले स्थिर.

  n>>=  1n
}
	   return res
}

	function inv (x) {
	if (x == 1n) return 1n;
  return pow(x, mod - 2n);

// स्थानीय प्रोग्राम का रूप तैयार करता है.
  }



     const mod = 998244353n     
 ; (input  => {
    const lines = input.split('\n')
   let [N, M, K] = lines[0].split(' ').map(BigInt)  



let  ans = 0n
let fa = 1n
   let fa2 = 1n
	     for (let k = 0n; k <= K; k++) {
 fa= fa * (k  || 1n )
// पठन बनाए रखता है भी वर्तमान लागू रूपांतरण आउटपुट से पहले सरल.
  fa2 = fa2 * (N - (k || (N - 1n))) % mod
let left = fa2 * inv(fa)
            ans += left * pow((M - 1n), (N - (k + 1n))) * M % mod
	}
// पठन व्यवस्थित करता है अंतिम मानव पठन.


console.log( (ans%  mod ) .toString())


  }) (input)
