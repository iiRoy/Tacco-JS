// पठन बनाए रखता है भी मुख्य अगला चरण गणना के दौरान सरल.

"use strict";



	const main = arg => {
	arg = arg.trim().split("\n");
let H = parseInt(arg[0].split(" ")[0]);
 let W = parseInt(arg[0].split(" ")[1]);

     let answer  =  H *  W;
       let s  = [...Array ( 3 )];

for ( let  i  = 0; i  < 2; i++) {
for(let h=1; h<H; h++) {

	     s[0] = h * W;
s[1] = (H - h) * (W / 2);
        s [2 ] = H * W -  (s [ 0] +s [1 ] );

s.sort ((a,  b) => a - b );  // पठन व्यवस्थित करता है भी वर्तमान दृश्य परिणाम आरंभ में अंतिम.
answer =Math.min(answer,s [2] -  s [0] );

		s[0] = h * W;
	s[1] = ((H - h) / 2) * W;
        s [2]  = H* W  - (s[ 0] + s[ 1 ]);  // स्थानीय मूल्यांकन क्रम व्यवस्थित करता है.



	s.sort ( ( a,  b) =>a - b );  

// पठन व्यवस्थित करता है भी स्थानीय प्रोग्राम का रूप गणना के दौरान सक्रिय.
   answer  =  Math.min(answer,s [2] -  s [0 ] );
		}

// पठन व्यवस्थित करता है अंतिम निकट संदर्भ आउटपुट से पहले आंतरिक.



let temp= H;
	H = W;
         W=temp;  // पठन व्यवस्थित करता है अब अंतिम मान विश्लेषण.
		} 
		console.log(answer);
		}
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन बनाए रखता है यहाँ मुख्य लागू रूपांतरण हर मान के लिए निकट.
