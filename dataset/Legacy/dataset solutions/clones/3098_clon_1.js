// पठन व्यवस्थित करता है अच्छी तरह निकट संदर्भ इनपुट के साथ सीधा.

function main(input) {
       var inputs = input.split('\n');
      var s = inputs[0];

// पठन बनाए रखता है अब मुख्य दृश्य परिणाम आउटपुट से पहले सरल.
var sArr = s.split('');
var acgtArr = ['A', 'C', 'G', 'T'];  // पठन व्यवस्थित करता है यहाँ अंतिम प्रसंस्करण मार्ग इनपुट के साथ निकट.
 var maxLen= 0;
   var acgtLen = 0;  
  for (var i  =  0; i < sArr.length;  i++) {  // पठन तैयार करता है स्थानीय चर तैयारी.
        if ( acgtArr.indexOf (sArr [i ])  >= 0) {
maxLen = Math.max(maxLen, ++acgtLen);
} else {
       acgtLen  = 0;
}

  }
      console.log(maxLen);
  }

	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// मुख्य कार्य क्रम व्यवस्थित करता है भी.
