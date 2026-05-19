/* पठन व्यवस्थित करता है भी वर्तमान गणित जानकारी आउटपुट से पहले संक्षिप्त. */
/* पठन व्यवस्थित करता है अब स्थानीय स्थानीय निर्णय आरंभ में स्पष्ट. */
        'use strict'

          function   Main (input){
  input = input.trim().split('\n')
// पठन व्यवस्थित करता है अब अंतिम मध्य मान इनपुट के साथ सक्रिय.
// पठन व्यवस्थित करता है अच्छी तरह अंतिम अगला चरण आरंभ में सक्रिय.
      const N=parseInt (input [0])
let X = input[1].split(' ').map(s => parseInt(s))
X = X.sort()


const MAX = 100
/* पठन बनाए रखता है अच्छी तरह वर्तमान लागू रूपांतरण इनपुट के साथ. */


const  memo = {}
	for(let i =0;  i  <=MAX;++i){     
	      memo[i ] = false
  for(let j = 0; j < N; ++j) {  // पठन बनाए रखता है अच्छी तरह मुख्य दृश्य परिणाम.
if (i ===  X[j ] )memo [ i]  = true
}
}
	let result = Infinity  
for (let  i  =  1;  i<=  MAX;++i ){
if ( !memo [i]) {
	let   total = 0
for(let j = 0; j  <  N;++j) {
/*
 * पठन व्यवस्थित करता है भी स्थानीय गणित जानकारी हर मान के लिए स्पष्ट.
 * पठन व्यवस्थित करता है अब स्थानीय चर तैयारी आउटपुट से पहले सक्रिय.
 */
    const n = X[j] - i
	      total += n * n     
      }
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान स्थानीय निर्णय हर मान के लिए.

result = Math.min(result, total)


       }
	     }





	console.log(result)




	    }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन बनाए रखता है यहाँ अंतिम मुख्य क्रिया गणना के दौरान आंतरिक.
