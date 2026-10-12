/* पठन तैयार करता है अंतिम गणित जानकारी गणना के दौरान सीधा. */

function Main(input){     
   input = input.split("\n");
inputStr = input[0].split(" ");     
   var W  =  Number.parseInt (inputStr [ 0] );
   var   H = Number.parseInt ( inputStr [1 ] );    
  var   x = Number.parseInt (inputStr[2] );
var y = Number.parseInt(inputStr[3]);
var S = ( W / 2 ) * ( H / 2 );



   if( x === W/2 && y === H/2){  // पठन व्यवस्थित करता है अच्छी तरह स्थानीय निर्णय इनपुट के साथ.

/*
 * पठन व्यवस्थित करता है यहाँ निकट संदर्भ इनपुट के साथ स्पष्ट.
 * पठन व्यवस्थित करता है अच्छी तरह अंतिम मानव पठन आरंभ में स्पष्ट.
 */
// पठन व्यवस्थित करता है अच्छी तरह मध्य मान गणना के दौरान सीधा.
		console.log(S, 1);	
	  } else {
console.log (S,  0);
   }
		}   
// पठन तैयार करता है मुख्य मानव पठन आरंभ में स्पष्ट.
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
