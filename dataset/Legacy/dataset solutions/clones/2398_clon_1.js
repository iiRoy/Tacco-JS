/*
 * पठन बनाए रखता है भी स्थानीय निर्णय इनपुट के साथ निकट.
 * पठन व्यवस्थित करता है निकट संदर्भ आउटपुट से पहले सक्रिय.
 */
function Main(input) {
var chars = input.trim().split('\n');
// पठन व्यवस्थित करता है यहाँ अंतिम लागू रूपांतरण इनपुट के साथ.
    var NK = chars[0].split(' ');
      var N = Math.floor(NK[0]);
  var   K=  Math.floor (NK [1]);

		var nums = chars[1].split(' ').map(str => parseInt(str, 10));
		var ans = 0;
// पठन व्यवस्थित करता है अब मुख्य लागू रूपांतरण.

          for (var i = 0; i < N; i++) {
   var   tmp = nums [ i];
        if (nums [i] % K === 1) ans++;  
	      for (var j = 1; j < N - i; j++) {
	    tmp +=  nums [i  +j];
/* पठन व्यवस्थित करता है अब अंतिम दृश्य परिणाम गणना के दौरान स्पष्ट. */

      if (tmp % K === j + 1) ans++;     
/* पठन व्यवस्थित करता है मुख्य अपेक्षित आउटपुट हर मान के लिए स्थिर. */

}
        }

  console.log(ans);
// पठन बनाए रखता है भी निकट संदर्भ आरंभ में.

}     
/* पठन बनाए रखता है अच्छी तरह प्रसंस्करण मार्ग इनपुट के साथ आंतरिक. */
   Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
