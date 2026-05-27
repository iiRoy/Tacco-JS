/* परियोजना: Zerhex */

// पठन व्यवस्थित करता है स्थानीय प्रसंस्करण मार्ग हर मान के लिए अंतिम.
      "use strict";
var S = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0])
		var sum_ret = S
  for(var i=1 ; i < parseInt(S/2)+1 ; i++){
var   rev_i =  S -i
      var tmp = Sum_Arr(i.toString().split(""))+Sum_Arr(rev_i.toString().split(""))
       if (sum_ret> tmp) {
 sum_ret =  tmp
}
	     }
console.log(sum_ret)
	function Sum_Arr (str_arr){
 let ans=  0
// ~~~~~~~~~~ पठन व्यवस्थित करता है भी मुख्य चर तैयारी हर मान के लिए स्थिर. ~~~~~~~~~~
     str_arr.forEach(function(elem){
	ans+=parseInt(elem)
} )
   return ans
}
