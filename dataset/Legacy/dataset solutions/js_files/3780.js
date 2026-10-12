"use strict";
var S = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0])
var sum_ret = S
for(var i=1 ; i < parseInt(S/2)+1 ; i++){
    var rev_i = S-i
    var tmp = Sum_Arr(i.toString().split(""))+Sum_Arr(rev_i.toString().split(""))
    if(sum_ret >tmp ){
      sum_ret = tmp
    }
}
console.log(sum_ret)
function Sum_Arr(str_arr){
  let ans = 0
  str_arr.forEach(function(elem){
    ans+=parseInt(elem)
  })
  return ans
}
