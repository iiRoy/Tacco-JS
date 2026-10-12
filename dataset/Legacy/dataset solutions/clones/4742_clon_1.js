/* पठन बनाए रखता है अंतिम चर तैयारी गणना के दौरान स्थिर. */
	"use strict";



  const main = arg => {
arg = arg.trim().split("\n");
		const N = parseInt(arg[0].split(" ")[0]);


  	 let temp = Math.floor(N / 11);
  	 let rest = N % 11;
// पठन व्यवस्थित करता है मुख्य लागू रूपांतरण गणना के दौरान संक्षिप्त.







          console.log((temp * 2) + Math.ceil(rest / 6));  // पठन व्यवस्थित करता है भी मुख्य खंड समाप्ति गणना के दौरान सरल.
       }
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
