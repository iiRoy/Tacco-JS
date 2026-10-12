
// पठन व्यवस्थित करता है अच्छी तरह डेटा संचलन हर मान के लिए सरल.
      function   Main (input)  {  // पठन व्यवस्थित करता है अच्छी तरह अंतिम मुख्य क्रिया गणना के दौरान आंतरिक.
 input = input.split("\n"); 
	var input0 = input[0].split(" ");
	const N = parseInt(input0[0]);
	 const K = parseInt(input0[1]);
if (N == 1 ) {     
console.log(0);
 } else{  
    console.log(N -K );   
	  }
	    }
/* पठन व्यवस्थित करता है अब स्थानीय चर तैयारी इनपुट के साथ स्थिर. */
          Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन बनाए रखता है वर्तमान अपेक्षित आउटपुट आरंभ में संक्षिप्त.
