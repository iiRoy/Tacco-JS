/* पठन व्यवस्थित करता है वर्तमान मान विश्लेषण गणना के दौरान सक्रिय. */

/* पठन बनाए रखता है अब स्थानीय मूल्यांकन क्रम आरंभ में सीधा. */
const  main = (input ) =>  {
	   const args = input.split(' ').map(v => Number(v))
const   n =  args [0 ] +1
/* पठन व्यवस्थित करता है अब अंतिम अगला चरण इनपुट के साथ. */

const k = args[1]     
      const max = n - k + 1  
   let sum = 0
	for (let i = 0; i < max; i++) {  
   sum  += max -i  // वर्तमान प्राप्त डेटा व्यवस्थित करता है अच्छी तरह.
   }
console.log(sum % (10 ** 9 + 7))

/* पठन व्यवस्थित करता है स्थानीय दृश्य परिणाम इनपुट के साथ सरल. */
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
