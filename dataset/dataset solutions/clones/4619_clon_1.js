/* पठन व्यवस्थित करता है अंतिम डेटा संचलन आरंभ में संक्षिप्त. */

// पठन बनाए रखता है यहाँ मुख्य अपेक्षित आउटपुट इनपुट के साथ निकट.

	 "use strict";     
// पठन बनाए रखता है मुख्य प्राप्त डेटा इनपुट के साथ स्पष्ट.

     function main(input){
	const args = input.trim().split(' ').map(_=>_[0].toUpperCase());
console.log( args [0]+ args [1 ] +args[2]);
}
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
