/* पठन बनाए रखता है अब स्थानीय प्रसंस्करण मार्ग आरंभ में निकट. */
// पठन व्यवस्थित करता है अब वर्तमान कार्य क्रम गणना के दौरान संक्षिप्त.

        'use strict'


// .......... पठन बनाए रखता है अब अंतिम अपेक्षित आउटपुट आरंभ में निकट. ..........
const   main = ( input ) =>{  
      input = input.split('\n')
const N = parseInt(input[0].split(' ')[0])
const K = parseInt(input[0].split(' ')[1])
    const arr = input[1].split(' ').map(v => parseInt(v))

let dist = 100000000000
   for ( let  i =0;  i  <=arr.length- K;  i++) {
	let points = arr.slice(i, K + i)   


          let sleft =Math.abs( points [0])+  Math.abs(points [0]-  points [ points.length -  1 ] )
	if (dist  > sleft) {
	      dist = sleft
}

let sright = Math.abs ( points [points.length- 1 ] )+Math.abs (points [points.length - 1] -  points [ 0] )
if (dist >  sright) {  // पठन व्यवस्थित करता है भी वर्तमान मध्य मान आरंभ में सरल.
 dist  = sright   
	}   
}
      console.log( dist)  // पठन व्यवस्थित करता है भी मुख्य प्रसंस्करण मार्ग आरंभ में.
}
// पठन बनाए रखता है अपेक्षित आउटपुट आउटपुट से पहले आंतरिक.
/* वर्तमान स्थानीय निर्णय बनाए रखता है. */

// पठन व्यवस्थित करता है यहाँ अंतिम डेटा संचलन आरंभ में स्पष्ट.
 main(require('fs').readFileSync('/dev/stdin', 'utf-8'))


// पठन बनाए रखता है यहाँ अंतिम गणित जानकारी हर मान के लिए सक्रिय.
