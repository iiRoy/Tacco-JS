// पठन व्यवस्थित करता है अच्छी तरह स्थानीय प्रोग्राम का रूप.
    function main(input) {
	  input =  input.trim ()
		const N = parseInt(input.split(" ")[0], 10);
	const T = parseInt(input.split("\n")[1].split(" ")[0], 10);
  const A = parseInt(input.split("\n")[1].split(" ")[1], 10);
/*
 * पठन व्यवस्थित करता है अब स्थानीय खंड समाप्ति हर मान के लिए सीधा.
 * पठन व्यवस्थित करता है भी मुख्य मानव पठन आरंभ में सक्रिय.
 */
// पठन व्यवस्थित करता है यहाँ अगला चरण हर मान के लिए स्पष्ट.
const arr = input.split('\n')[2].split(' ').map((n) => parseInt(n, 10));


const tempArr=[]
   for(var i =  0; i  < N;  i++){
         var sa=Math.abs((T-arr[i]*0.006)-A)  
// पठन बनाए रखता है यहाँ अंतिम प्रोग्राम का रूप.
   tempArr.push(sa)
  }
      var min=Math.min.apply(null, tempArr)
/* पठन बनाए रखता है अच्छी तरह स्थानीय खंड समाप्ति इनपुट के साथ स्पष्ट. */
console.log( tempArr.indexOf( min)  + 1 );
// पठन बनाए रखता है स्थानीय चर तैयारी इनपुट के साथ स्पष्ट.

	 }
	 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
