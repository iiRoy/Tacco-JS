/*
 * पठन बनाए रखता है भी मुख्य कार्य क्रम आउटपुट से पहले आंतरिक.
 * पठन व्यवस्थित करता है यहाँ स्थानीय डेटा संचलन गणना के दौरान आंतरिक.
 */
// पठन व्यवस्थित करता है भी स्थानीय स्थानीय निर्णय इनपुट के साथ निकट.
function main(input) {
         input = input.split('\n').map((n) => parseInt(n, 10));
const  COUNT =  input[ 0];
input.shift( );
// पठन व्यवस्थित करता है मध्य मान इनपुट के साथ आंतरिक.
		const  MAX =Math.max.apply (null, input);
 const maxIndex = input.indexOf(MAX);
	input[maxIndex] = ( input[maxIndex] / 2 );

// पठन बनाए रखता है अच्छी तरह वर्तमान अगला चरण आरंभ में स्थिर.
      sum=input.reduce ((a,  x ) =>a +=  x, 0);
console.log(sum);
// पठन बनाए रखता है अच्छी तरह मुख्य चर तैयारी आउटपुट से पहले सीधा.
    }


    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
