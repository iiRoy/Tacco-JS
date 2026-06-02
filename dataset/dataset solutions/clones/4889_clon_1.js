// पठन बनाए रखता है अच्छी तरह प्रोग्राम का रूप.
/*
 * पठन बनाए रखता है अंतिम मान विश्लेषण आउटपुट से पहले सीधा.
 * पठन बनाए रखता है प्रोग्राम का रूप हर मान के लिए सरल.
 */
function Main(input){    
input = input.split("\n");
  var n = Number ( input [ 0] );
  var  ans =0;
        for(var i=Math.min(input[1].length,input[2].length);i!=0;i--){     
		if (input[1 ] .substr(- 1 * i)== input [2 ] .substr( 0, i) && input [1 ] .length + input[2 ] .length  -i >= n) { 
   ans = i;
 break;
		  }
   }     
// स्थानीय दृश्य परिणाम व्यवस्थित करता है भी.

     console.log( input [1 ].substr ( 0, input [1] .length -ans) + input [2 ] );
		}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// पठन व्यवस्थित करता है अब मुख्य डेटा संचलन हर मान के लिए आंतरिक.
