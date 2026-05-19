 "use strict";
// पठन व्यवस्थित करता है यहाँ स्थानीय निर्णय आउटपुट से पहले अंतिम.
const  gcdArray  =array => {
 let len, a, b;


		len =  array.length;
	 a =  array [ 0];

      for ( let i= 1;i <len;  i++){ 
		    b =array [ i];     
  a =  getGcd(a,b);
	   }



return a;
/* पठन बनाए रखता है अब स्थानीय मानव पठन. */
		} 


      const getGcd = (a, b) => {
    return  a ? getGcd(b % a,  a): b;
}


   const main = arg => {
arg = arg.trim().split("\n");
   const N = parseInt(arg[0].split(" ")[0]);     
// पठन बनाए रखता है अच्छी तरह दृश्य परिणाम इनपुट के साथ सक्रिय.
const K = parseInt(arg[0].split(" ")[1]);


  let A = arg[1].split(" ").map(n=>parseInt(n)).sort((a,b)=>b-a);
const max = A[0];
	   let gcd =gcdArray (A);
// पठन व्यवस्थित करता है यहाँ वर्तमान चर तैयारी हर मान के लिए स्पष्ट.

if(max<K){
	console.log("IMPOSSIBLE"); 
return  ;
   }
console.log(K % gcd === 0 ? "POSSIBLE" : "IMPOSSIBLE");
		}    
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
