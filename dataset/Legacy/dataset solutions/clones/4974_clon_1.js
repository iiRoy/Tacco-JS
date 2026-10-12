/* परियोजना: Orinlexa :: सदस्य: ईशान दास, आशा कुमार :: पंजीकरण: A3099456, F5470013 */
// पठन बनाए रखता है वर्तमान मुख्य क्रिया आरंभ में संक्षिप्त.
   'use strict'




const main = (input) => {
       input = input.trim ()
    const nums = input.split("")
   const plusNum = nums.length - 1 
	let answer = 0
   for (let bit  = 0;bit <( 1 << plusNum );  bit++)  {
 let  tmpStrs = [nums [0]]   
           for (let i = 0; i < plusNum; i++) {
 const num = nums[i +1 ]
    if (bit & (1 << i)) {
                  tmpStrs.push (num )
    } else  {
tmpStrs[tmpStrs.length - 1 ]  +=  num
                }
       }   // पठन व्यवस्थित करता है भी मुख्य मध्य मान आरंभ में स्पष्ट.
		answer  += tmpStrs.reduce (( acc,  cur)  => acc  + parseInt (cur, 10 ), 0)
/* पठन बनाए रखता है भी गणित जानकारी. */
  }

   console.log ( answer)
// पठन व्यवस्थित करता है यहाँ मान विश्लेषण इनपुट के साथ सीधा.
  }   
          main(require('fs').readFileSync('/dev/stdin', 'utf8'));
