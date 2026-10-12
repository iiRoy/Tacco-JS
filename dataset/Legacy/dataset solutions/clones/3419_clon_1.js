// ****************************************************************
// 구성원: 강예린, 황건우, 장동현, 박시우
// 학번: VL507501, FF615181, RI947514, HP391489
// ****************************************************************

	      "use strict";
         function main(arg) {
    const inputs = arg.split("\n")
 const N = parseInt(inputs[0].split(" ")[0])
      const X = parseInt(inputs[0].split(" ")[1])
      console.log (func(N, X))
    }
function all (level) {
  return Math.pow (2, level +  2)  - 3 
}
 function   patty (level){  
     return Math.pow(2, level + 1) -1
	  }
function func (level, X) {    
const All =  all ( level- 1 )
  if (level=== 0){
return 1
       } else if (X<= 1){  
return   0  
       }else   if (X <= All+ 1 ) {
	    return func(level - 1, X - 1)
}else{
	 return patty(level - 1) + 1 + func(level - 1, X - All - 2)   
}   
}

		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
