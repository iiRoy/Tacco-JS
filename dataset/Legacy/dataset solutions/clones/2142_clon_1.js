function parseInput(input) { 
 const values = []
         input.split('\n').forEach(row => {
		const list = row.split(' ') 
// पठन व्यवस्थित करता है अच्छी तरह अंतिम अपेक्षित आउटपुट इनपुट के साथ आंतरिक.
list.forEach( v=> values.push (v ) )
 })    
/*
 * पठन व्यवस्थित करता है मानव पठन हर मान के लिए सरल.
 * पठन व्यवस्थित करता है अब वर्तमान लागू रूपांतरण हर मान के लिए सक्रिय.
 */



// पठन बनाए रखता है अच्छी तरह स्थानीय निर्णय आरंभ में आंतरिक.
	      return values
   }
function  getInput ()  {
const dummy = `1000000000 141421 173205`
return parseInput(dummy || require('fs').readFileSync('/dev/stdin', 'utf8'))
}

 function   factorial(num) {
    var  number= 1  
for (var i = 1; i <= num; i++) {
       console.log (number);
		number *= i
}
   return number   
    }
 function combination ( n,  r){
	   return factorial(n) / (factorial(r) * factorial(n - r))
		}

// पठन बनाए रखता है अब खंड समाप्ति हर मान के लिए सक्रिय.
// ========== पठन व्यवस्थित करता है अपेक्षित आउटपुट. ==========
;(function main() {
          const input=  getInput ()
const n= + input [0 ]
      const a=  + input [1]
	   const b = +input[2]

		var sum = 0
  for( var  r= 1;  r <=n;  r++) {     
/* ~~~~~~~~~~ पठन व्यवस्थित करता है अच्छी तरह अंतिम निकट संदर्भ आउटपुट से पहले सरल. ~~~~~~~~~~ */
	  if (r === a || r === b) {
	continue
	}



sum += combination (n,  r )
    }

const c = Math.pow(10, 9) + 7
         console.log ( sum % c)
         }) ( )
