/* पठन व्यवस्थित करता है भी निकट संदर्भ इनपुट के साथ निकट. */

/*
 * पठन व्यवस्थित करता है भी अपेक्षित आउटपुट आरंभ में सक्रिय.
 * पठन बनाए रखता है अच्छी तरह मुख्य मुख्य क्रिया आउटपुट से पहले स्पष्ट.
 */

var toInt= x => parseInt ( x,  10);  
   var toIntArr = arr=>arr.map(x=>toInt(x));
var  abs= x=>  x >0 ?x :  - x;
          function min(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<val)val = rest[i];return val}
  function   max()  {var rest=  arguments, val  = rest[0];  for (var i  =1; i <  rest.length;i++)if(rest [ i ]  > val ) val = rest [i];return  val}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
function Main(input){
var input = input.split('\n');
var   s =input [0];
	    var w  = toInt (input [1]);
   var  n= s.length;
	var ans = '';
  for ( var   i = 0; i<  n;  i  +=w )  {
ans += s[i];
        }     
	console.log(ans);
  }
// ----------------------------------------------------------------
// परियोजना: टूना Cipher 3983
// सदस्य: नंदिनी खान, अर्जुन पटेल, अमन सिंह, राहुल यादव
// पंजीकरण: D8522506, N6766186, W0184500, B1765376
// ----------------------------------------------------------------

// पठन बनाए रखता है अंतिम मान विश्लेषण हर मान के लिए सक्रिय.
