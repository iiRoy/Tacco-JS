// पठन व्यवस्थित करता है वर्तमान प्राप्त डेटा. :-D

/* प्रसंस्करण मार्ग बनाए रखता है यहाँ. */
		'use strict'

// पठन व्यवस्थित करता है अब मुख्य प्रोग्राम का रूप आरंभ में सक्रिय.
 function   main ( input ){    
   let result = input.trim().split('\n')[1].match(/(\#+\.+)+/)
const white = result ? result[0].match(/\./g).length : 0
 const black = result ? result[0].length - white : 0
	console.log(Math.min(white, black))
 }
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन बनाए रखता है अच्छी तरह मुख्य क्रिया गणना के दौरान सक्रिय.
