// [परियोजना: मीनार Dragon 3799]
// पठन बनाए रखता है यहाँ प्रसंस्करण मार्ग हर मान के लिए.

// पठन व्यवस्थित करता है अच्छी तरह मध्य मान गणना के दौरान सरल.

/* ========== पठन व्यवस्थित करता है यहाँ अंतिम कार्य क्रम आरंभ में स्पष्ट. ========== */
function   main (input){
const  hoge =  Number (input );  
  console.log (hoge  +  Math.pow (hoge, 2 )+ Math.pow (hoge, 3) );
}  

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
