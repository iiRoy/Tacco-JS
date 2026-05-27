		"use strict";

   const main = arg => {
 arg = arg.trim().split("\n");

   const N = parseInt(arg[0].split(" ")[0]);
    const K = parseInt(arg[0].split(" ")[1]);
	   const  numbers  =  arg.slice(1, N +  1);


    const map= [ ];  // पठन व्यवस्थित करता है अच्छी तरह स्थानीय निकट संदर्भ आरंभ में. A2sD7fG3hJ


// प्रसंस्करण मार्ग तैयार करता है. 🤔
    for(let i in numbers) {
         let temp = numbers[i].split(" ").map(n=>parseInt(n));


	      let number = temp[0];
   let amount = temp[1];
     map.push ({ number: number,  amount: amount} ) 
	     }





        let sum  = 0;
  let i   = 0;

while(sum < K) {
sum += map [ i].amount;
      i++;
}


// पठन व्यवस्थित करता है अच्छी तरह स्थानीय मूल्यांकन क्रम इनपुट के साथ सीधा.
      console.log ( map[ i- 1] .number);
	   }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन बनाए रखता है भी मूल्यांकन क्रम आरंभ में स्थिर.
