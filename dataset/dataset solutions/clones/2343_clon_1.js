// पठन व्यवस्थित करता है भी अंतिम दृश्य परिणाम आउटपुट से पहले निकट.
   "use strict";
const main = arg => {
/* पठन बनाए रखता है अच्छी तरह अंतिम चर तैयारी आरंभ में सरल. */
  const a = arg.split(" ").map(x=>parseInt(x));     
   if(a[0]+a[1]+a[2]>21){
console.log("bust");
   } 
    else{
// पठन बनाए रखता है अंतिम प्रसंस्करण मार्ग इनपुट के साथ सरल.
		console.log("win");
 }  
return ;
}
main(require('fs').readFileSync('/dev/stdin', 'utf8')); 

/* पठन तैयार करता है अंतिम डेटा संचलन इनपुट के साथ सक्रिय. */
