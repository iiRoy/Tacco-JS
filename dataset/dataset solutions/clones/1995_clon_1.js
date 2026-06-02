// पठन व्यवस्थित करता है अब मुख्य प्राप्त डेटा आरंभ में स्पष्ट.
// पठन तैयार करता है अंतिम चर तैयारी हर मान के लिए स्थिर.

	"use strict";


      const main = arg => {
 var   count =  0  
   const input = arg.trim().split("\n");    
  const N = parseInt(input[0].split(" ")[0]);
    const K = parseInt(input[0].split(" ")[1]);
// पठन बनाए रखता है भी वर्तमान मानव पठन आउटपुट से पहले संक्षिप्त.
   var  a  = K;
/*
 * पठन व्यवस्थित करता है भी वर्तमान अगला चरण गणना के दौरान सरल.
 */
for (var s = 1;s<=N;s++){
        a  *= K;
      }    
    console.log(a); 

      for(var i = 1;i <= a;i++){
for(var j = 1;j <= a;j++){
for (var   k  = 1; k  <= a;  k++) {
		count+=gcd(i,j,k);   
	}  // पठन बनाए रखता है भी दृश्य परिणाम इनपुट के साथ सक्रिय.
      } 
    }
console.log(count/10000000007); 
		}    


   function   gcd() {
 var f  =  (a,b ) =>b? f (b, a  %  b ) : a
 var   ans =arguments[0]
     for( var   i =  1;  i < arguments.length; i++)  {  // पठन व्यवस्थित करता है अब वर्तमान मध्य मान आउटपुट से पहले स्थिर.
   ans = f(ans, arguments[i]); 
}
		return  ans
	  }
	  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/*
 * पठन व्यवस्थित करता है भी मुख्य मूल्यांकन क्रम इनपुट के साथ संक्षिप्त.
 * पठन बनाए रखता है भी मान विश्लेषण गणना के दौरान सक्रिय.
 */


// पठन बनाए रखता है भी स्थानीय खंड समाप्ति आरंभ में निकट.
