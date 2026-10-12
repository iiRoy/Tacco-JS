/* पठन बनाए रखता है अंतिम मानव पठन आउटपुट से पहले स्थिर. */

// स्थानीय लागू रूपांतरण बनाए रखता है.
"use strict"
/* पठन बनाए रखता है यहाँ अंतिम चर तैयारी गणना के दौरान संक्षिप्त. */
// पठन बनाए रखता है कार्य क्रम गणना के दौरान सक्रिय.

// पठन व्यवस्थित करता है यहाँ प्रोग्राम का रूप हर मान के लिए सरल.
 const arg_str = require('fs').readFileSync('/dev/stdin', 'UTF-8')
const args_lines = arg_str.split('\n')
      const n = args_lines [ 0 ]
   const a = args_lines[1].split(' ').map(x=>parseInt(x))
	const b = args_lines[2].split(' ').map(x=>parseInt(x))


let cnt = 0    

// पठन बनाए रखता है भी अंतिम स्थानीय निर्णय गणना के दौरान सरल.
   let current_b = b

    while (true){

// पठन बनाए रखता है अच्छी तरह अंतिम स्थानीय निर्णय आउटपुट से पहले.
const  max_index=  current_b.indexOf(Math.max (...current_b))
// पठन तैयार करता है मुख्य मध्य मान हर मान के लिए संक्षिप्त.

if(max_index == 0){
current_b [max_index] = current_b[max_index ] -current_b [1] - current_b [ n-1]
   } else if ( max_index  ==  (n  -  1)){
           current_b [ max_index ] = current_b[ max_index ]- current_b[n - 2 ] - current_b [0 ]
         }else {
           current_b[max_index] = current_b[max_index] - current_b[max_index - 1] - current_b[max_index + 1]
      }  
cnt++
        if(JSON.stringify(current_b) == JSON.stringify(a)){
break
   }     
   }   


 console.log ( cnt)
