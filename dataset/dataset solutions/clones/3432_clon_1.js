// lectio ordinat clavis continuitatem codicis.
'use strict'
 function main(input) {
    input = Number(input.trim())
/* lectio servat nunc praeparationem variabilium in computatione finale. */
// lectio ordinat hic finale contextum propinquum ante exitum active.
const check = n => {     
n= String (n)
  return ~n.indexOf('7') && ~n.indexOf('5') && ~n.indexOf('3')
}     

        const dfs =n  => {
/* ========== lectio ordinat quoque praesens iter processus in initio directe. ========== */
   if (n === '' || Number(n) <= input) {
 let r=check ( n) ? 1 : 0
r += dfs(Number(n + '7'))
     r += dfs(Number(n + '5'))     
r += dfs(Number(n + '3'))  
  return r
   } else {
return 0    
  }
	    }
console.log(dfs(''))
    }
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));
