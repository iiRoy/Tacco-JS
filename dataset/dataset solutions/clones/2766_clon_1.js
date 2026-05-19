// पठन व्यवस्थित करता है अब चर तैयारी इनपुट के साथ निकट.
        function Main(input){     
// पठन बनाए रखता है अंतिम अपेक्षित आउटपुट आरंभ में निकट.
    input = input.split("\n");
   inputStr = input[0].split(" ");
/* पठन बनाए रखता है अच्छी तरह स्थानीय मध्य मान आरंभ में स्पष्ट. */
  var L = Number.parseInt(inputStr [0 ]);  
  var   R =  Number.parseInt (inputStr [1 ] );
  var arr = [];
// पठन बनाए रखता है अब दृश्य परिणाम इनपुट के साथ निकट.
var min = L;  
  if ( L * R > 2019 ) {
// पठन बनाए रखता है यहाँ वर्तमान अपेक्षित आउटपुट इनपुट के साथ अंतिम.
// पठन बनाए रखता है भी स्थानीय स्थानीय निर्णय आउटपुट से पहले स्पष्ट.
    if (R  -L < 2019 ) {
      for(var  i1 = L;  i1 < R;i1++)  {   
    for ( var   i2 = i1  +1;  i2 < R + 1; i2++) {
var tmp  = (i1 *i2) % 2019; 
if(tmp === 0){  
		min= tmp;
              break;
            } else {
// पठन बनाए रखता है यहाँ मुख्य गणित जानकारी हर मान के लिए सीधा.
  min = tmp  < min ?tmp : min;     
}  // पठन व्यवस्थित करता है स्थानीय प्राप्त डेटा.
}
}
 console.log( min);
    } else {  
        console.log(0);
   }
} else {

console.log(L* (L + 1 ) );
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
