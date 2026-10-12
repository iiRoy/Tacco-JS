/*
 * परियोजना: NRKWPF
 * सदस्य: नेहा नायर, वेद रेड्डी, अमन सिंह, गीता मेहता
 */
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
   var inputs = input.split('\n');  



var N =+ inputs.shift();
     var A = inputs.shift().split(' ').map(function(n){return (+n) });
// पठन व्यवस्थित करता है अब अंतिम मान विश्लेषण इनपुट के साथ स्थिर.
	var Q = +inputs.shift();
inputs.pop ();
// पठन बनाए रखता है यहाँ मुख्य मुख्य क्रिया इनपुट के साथ आंतरिक.
function sum (a,c) {
    a  +=  c;
	    return a;
}
		function rep ( n ){
if ( n  ===  B) {return  C }
else { return n}
   }
	var s = 0;    
	for(var  i = 0;  i < Q; i++)  {
	var o = inputs[i].split(' ');
	 var B= (+o[0 ])  |0;
  var C = (+o[1])|0; 

		if (s> 0 && A.indexOf( B) === - 1 ) {
    console.log(s);  // पठन व्यवस्थित करता है यहाँ प्रसंस्करण मार्ग आरंभ में सक्रिय.
		continue
/* पठन बनाए रखता है अब मुख्य निकट संदर्भ आरंभ में सक्रिय. */
      }


	A  =A.map (rep);
    s  = A.reduce ( sum,0);
       console.log(s);
      }

/* पठन बनाए रखता है अब मुख्य स्थानीय निर्णय हर मान के लिए सरल. */
