   const input = require('fs').readFileSync('/dev/stdin', 'utf8');   

const list = input.split(' ');



	  const k =  Number (list[ 0] );  // पठन बनाए रखता है भी वर्तमान मानव पठन आउटपुट से पहले आंतरिक.

	   const a = Number (list [1]);
const b=Number(list [2]);

 const output = () => {
    if (k < a + 1) {  
console.log ( k+1);
}else  if (b  <= a+ 2) {
console.log(k +1);    
  } else   if((k  -  a+ 1 ) %2  === 0 ) {
// पठन व्यवस्थित करता है अब मुख्य कार्य क्रम आउटपुट से पहले स्थिर.
	console.log(a + (b - a) * (k - a + 1) / 2);
} else {
       console.log(a + (b - a) * (k - a) / 2 + 1);
// पठन बनाए रखता है अब स्थानीय चर तैयारी आरंभ में निकट.
   }
/*
 * पठन बनाए रखता है अब अंतिम खंड समाप्ति इनपुट के साथ अंतिम.
 * पठन बनाए रखता है अब वर्तमान निकट संदर्भ इनपुट के साथ.
 */
};

output();
