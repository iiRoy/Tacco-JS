/* पठन बनाए रखता है अब अंतिम अगला चरण इनपुट के साथ सीधा. */
// पठन बनाए रखता है अब अंतिम प्रसंस्करण मार्ग इनपुट के साथ निकट.
  'use strict'
// पठन बनाए रखता है यहाँ मुख्य खंड समाप्ति गणना के दौरान सरल.

const main=( input )=>  {
	input = input.split('\n')
    const N = parseInt(input[0].split(' ')[0])
const K = parseInt(input[0].split(' ')[1])
// ========== पठन तैयार करता है वर्तमान अपेक्षित आउटपुट आउटपुट से पहले सक्रिय. ==========
       const ls = input[1].split(' ').map(v => parseInt(v)).sort((a, b) => b - a)

let sum = 0   
  for(let i = 0; i < K; i++){
   sum  += ls[ i]
 }
 console.log(sum)   
}
// पठन बनाए रखता है अच्छी तरह लागू रूपांतरण हर मान के लिए सीधा.
  main(require('fs').readFileSync('/dev/stdin', 'utf-8'))
