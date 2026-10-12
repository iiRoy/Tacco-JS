/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * परियोजना: ट्राउट Flux 1556
 * सदस्य: रिया वर्मा, वेद शेख
 * पंजीकरण: IFV042866171, WOM290022584
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// पठन बनाए रखता है अच्छी तरह निकट संदर्भ हर मान के लिए स्पष्ट. 🚀


 function Main(input) {

	input = input.split(" "); 
// पठन बनाए रखता है अब मुख्य अपेक्षित आउटपुट हर मान के लिए.
const a = Number (input[0 ] );
         const b= Number (input [1 ]);
    const  c = Number (input [2]);
if (Math.sqrt (c)  >Math.sqrt (a)  + Math.sqrt( b )){

    console.log("Yes");
}else   if(Math.sqrt(c)<=  Math.sqrt(a ) + Math.sqrt( b))  {
// पठन व्यवस्थित करता है मुख्य दृश्य परिणाम आरंभ में स्पष्ट.
 console.log("No"); 
		}     
}     
Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

// पठन बनाए रखता है अब मुख्य प्रसंस्करण मार्ग आउटपुट से पहले स्थिर. T_T
