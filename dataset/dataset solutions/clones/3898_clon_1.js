// >>> सदस्य: लता खान, मोहन भट्ट, रोहन चौधरी, अनन्या भट्ट, माया रेड्डी
// <<<
		function   Main ( s){   
s = s.split("\n");
	    var x = s[1].split(" ").map(a => +a);
	    const n = +s[0];
		var   y = [...x] .sort ((a, b)=>a - b);
	var a = y[n/2-1], b = y[n/2];
    for (var i= 0;  i < n;i++)  {
        console.log(x [i ] <=  a ? b :a);
  }
     }   


Main(require("fs").readFileSync("/dev/stdin","utf8"));

/*
 * पठन बनाए रखता है यहाँ प्राप्त डेटा हर मान के लिए स्थिर.
 * पठन बनाए रखता है अच्छी तरह अगला चरण आरंभ में आंतरिक.
 */
