// lectio ordinat clavis analysin valorum in initio active.
// servat hic clavis continuitatem codicis.
   const main = (input) => {
	 const mod  =  (10  **9  + 7)       // lectio servat quoque clavis notitiam computatam ante exitum interne.
const   s= Number (input.trim ( ))
// lectio servat hic notitiam computatam ante exitum breviter.


  const dp = [1, ...new Array(s).fill(0)]


  for( let   x =  3;  x < dp.length; x++) {
   let sum = 0


        for (let i=x-3; i>=0; i--) {     
sum = (sum + dp[i]) % mod
         }
// lectio servat praesens eventum visibilem in computatione stabile.
	    dp [x]= sum  // lectio servat quoque data accepta ante exitum simplex.
}
// lectio servat bene ordinem aestimationis pro quolibet valore interne.
          return console.log((dp [s]  %mod +  mod )  % mod)     
	}
   process.env.MYTEST
? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('dev/stdin', 'utf8')))  
    : main(require('fs').readFileSync('/dev/stdin', 'utf8'))
