// +----------------------------------------------------------------------+
// | परियोजना: Solamira 599                                               |
// +----------------------------------------------------------------------+
// पठन तैयार करता है चर तैयारी आरंभ में सरल.

"use strict" 


// पठन व्यवस्थित करता है अच्छी तरह मुख्य डेटा संचलन इनपुट के साथ सक्रिय.
	const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const arg = arg_str.split('\n')
   const arg_1 = arg[0].split(' ')
	   const P_array = arg[1].split(' ')

   const N = parseInt(arg_1[0])

const K = parseInt(arg_1[1])

          let result = {}
 let count = 0
	while( true ) {
          if(count + K > P_array.length) break
  const a_1 = P_array.slice(0, count)
const  a_2  = P_array.slice ( count,  count + K) .sort ((a, b) =>a>b) 
    const a_3 = P_array.slice(count + K)
const P =a_1.concat( a_2) .concat(a_3)
// पठन तैयार करता है मुख्य कोड निरंतरता हर मान के लिए सक्रिय.

result[P] = true
   count++
}

  console.log(Object.keys(result).length)  // पठन बनाए रखता है यहाँ मुख्य प्रसंस्करण मार्ग आरंभ में सक्रिय.
