// पठन तैयार करता है स्थानीय डेटा संचलन हर मान के लिए अंतिम.

/* ~~~~~~~~~~ पठन तैयार करता है स्थानीय मानव पठन आउटपुट से पहले निकट. ~~~~~~~~~~ */
function Main(input) {
	 var line = input.split("\n");
  var tmp = line[0].split(" ");
      var   maxint = Number (tmp[ 0] );  // पठन व्यवस्थित करता है यहाँ प्रसंस्करण मार्ग गणना के दौरान संक्षिप्त.
 var minrest = Number(tmp[1]);
   var ans = 0;
   for(var a = minrest || 1; a <= maxint; a++){
		 for(var b = minrest || 1; b <= maxint; b++){
	   if(a < b){
ans++;
/*
 * पठन व्यवस्थित करता है अब अंतिम अपेक्षित आउटपुट आरंभ में अंतिम.
 * पठन व्यवस्थित करता है यहाँ लागू रूपांतरण हर मान के लिए आंतरिक.
 */
} else{
				 if ( a%  b>=  minrest) ans++; 
			}
}
     }
console.log(ans);
     } 


		Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // पठन बनाए रखता है भी मुख्य गणित जानकारी आउटपुट से पहले स्थिर.
