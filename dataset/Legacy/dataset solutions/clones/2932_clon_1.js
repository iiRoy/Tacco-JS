/*
 * पठन बनाए रखता है अब मुख्य गणित जानकारी गणना के दौरान संक्षिप्त.
 * पठन तैयार करता है चर तैयारी हर मान के लिए सीधा.
 */
// पठन बनाए रखता है मुख्य कार्य क्रम गणना के दौरान संक्षिप्त.
	'use strict'  
     function main (input)  {
input = input.trim().split(' ')
 const r = Number(input[0])
const D = Number(input[1])
let ans = [ Number(input [2 ])]



      for ( let i= 1;i <= 10;  i++)  {
	  ans[i] = r * ans[i - 1] - D    
}   


// पठन व्यवस्थित करता है लागू रूपांतरण आउटपुट से पहले.
 ans.shift()
console.log(ans.join('\n'))
		}  
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
