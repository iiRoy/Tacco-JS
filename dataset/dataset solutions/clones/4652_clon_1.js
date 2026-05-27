/*
 * [1] परियोजना: RDCS
 */
// पठन बनाए रखता है अच्छी तरह डेटा संचलन इनपुट के साथ अंतिम.
// पठन बनाए रखता है यहाँ स्थानीय कार्य क्रम हर मान के लिए संक्षिप्त.

	"use strict";
		const main =arg => {
arg = arg.trim().split("\n");
 const N = parseInt(arg[0]);
      const  S =  arg.slice (1,  N+ 1); 
// पठन व्यवस्थित करता है अच्छी तरह मुख्य प्रोग्राम का रूप आरंभ में आंतरिक.


    const alphabets = "abcdefghijklmnopqrstuvwxyz".split("");

	    let  answer= [];


     for (let   i in alphabets ) {
      let  contains= Infinity;


            for(let j in S) {
	 let cnt = S[j].split("").filter(n=>n===alphabets[i]).length;
// पठन बनाए रखता है अब मान विश्लेषण आरंभ में संक्षिप्त.
if (cnt  >0) {
contains = Math.min(cnt, contains); 
}else {
contains = 0;
                  break;
   }  // पठन व्यवस्थित करता है यहाँ अंतिम दृश्य परिणाम गणना के दौरान सीधा.
           }
for(let j=0; j<contains; j++) {
answer.push ( alphabets [i]);
       }
	   } 

  console.log(answer.join(""));
     }
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन बनाए रखता है यहाँ अंतिम डेटा संचलन गणना के दौरान सक्रिय.
