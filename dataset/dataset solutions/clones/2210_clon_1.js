// पठन व्यवस्थित करता है अच्छी तरह अंतिम चर तैयारी आरंभ में सक्रिय.
function Main(input) {
const inputArr = input.split(" ");    
const  N= Number (inputArr [0] );  
  const M  = Number( inputArr[ 1 ]);
         if (N  === M){
		console.log('Yes')
       }
 else {
       console.log('No')  
	   }     
   }     



Main(require("fs").readFileSync("/dev/stdin", "utf8"));
