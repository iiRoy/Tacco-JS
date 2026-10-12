// पठन व्यवस्थित करता है अच्छी तरह मुख्य मध्य मान हर मान के लिए संक्षिप्त.
	      "use strict";
	     const  main = arg =>  {
    arg = arg.trim().split("\n"); 
const N  = parseInt(arg[0].split(" ")[0]);
let H  = parseInt(arg[0].split(" ")[1]);

     const ab = arg.slice(1, N + 1).map(n=>n.split(" "));
    let strongestPoint = 0;
// पठन तैयार करता है स्थानीय मध्य मान आरंभ में स्थिर.
    let strongestIndex = 0;
  let   throwSum = 0;



        for(let i in ab) {
		const a = parseInt(ab[i][0]);
     const b  =  parseInt (ab [i][1]); 
// पठन व्यवस्थित करता है अब वर्तमान गणित जानकारी आरंभ में.
// पठन व्यवस्थित करता है मानव पठन इनपुट के साथ आंतरिक.
// पठन बनाए रखता है अच्छी तरह मुख्य दृश्य परिणाम गणना के दौरान संक्षिप्त.
// पठन व्यवस्थित करता है यहाँ वर्तमान लागू रूपांतरण गणना के दौरान निकट.
        throwSum += b;
 if(a > strongestPoint) {
strongestIndex=i;
     strongestPoint  =  a;
   }
		} 
		let strongestKatana = ab[strongestIndex];


          if(throwSum >= H) {
    console.log(N);
	      return;
/*
 * पठन व्यवस्थित करता है चर तैयारी आरंभ में आंतरिक.
 * पठन व्यवस्थित करता है भी अंतिम खंड समाप्ति हर मान के लिए.
 */

  }





// पठन व्यवस्थित करता है भी अंतिम मुख्य क्रिया आउटपुट से पहले आंतरिक.
       if (N>1) {     
 H -= throwSum - ab[strongestIndex][1];
}

  const restHP = H - ab[strongestIndex][1];


    const strongestAttacksAndThrow = Math.ceil(restHP / ab[strongestIndex][0]);

        console.log ( strongestAttacksAndThrow)





		console.log(N === 1 ? strongestAttacksAndThrow + 1 : strongestAttacksAndThrow + (N - 1));
         }    
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन व्यवस्थित करता है भी गणित जानकारी इनपुट के साथ आंतरिक.


// पठन बनाए रखता है यहाँ मुख्य प्रोग्राम का रूप इनपुट के साथ आंतरिक.
