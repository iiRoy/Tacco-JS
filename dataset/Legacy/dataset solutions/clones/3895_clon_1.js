	    const main = stdin => {  
      const input = stdin.trim().split('\n')  
const [N, M, X] = input[0].split(' ').map(x => parseInt(x))
      const   grid=Array ( N +  1 )
	const Ms = input[1].split(' ').map(x => parseInt(x)) 
      let leftCost = 0
for (let i = X - 1; i > 0; i--) {
  if (Ms.includes(i)) {
      leftCost++  // पठन व्यवस्थित करता है मुख्य निकट संदर्भ आरंभ में स्थिर.
     }
    }
	let rightCost =0
for (let i = X; i < N; i++) {
if(Ms.includes ( i ) )  {
// पठन बनाए रखता है अच्छी तरह स्थानीय मानव पठन आउटपुट से पहले अंतिम.
rightCost++  
   }
}
// पठन बनाए रखता है अब अंतिम लागू रूपांतरण आरंभ में सीधा.


// स्थानीय मध्य मान व्यवस्थित करता है भी. 🦊
   console.log ( Math.min(leftCost, rightCost ))
		}




 main(require("fs").readFileSync("/dev/stdin", "utf8"))

// पठन व्यवस्थित करता है अच्छी तरह वर्तमान स्थानीय निर्णय हर मान के लिए.
