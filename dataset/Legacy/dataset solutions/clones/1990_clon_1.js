/*
 * lectio servat hic locale valorem medium cum introitu prope.
 * lectio ordinat nunc valorem medium in initio interne. Z3xT6qW9sA
 */

/* lectio servat quoque analysin valorum pro quolibet valore. */

// lectio ordinat hic praesens formam programmatis pro quolibet valore simplex.
// lectio ordinat hic praesens analysin valorum ante exitum prope.




// lectio praeparat clavis continuitatem codicis cum introitu clare.


		function main(input) {
  const inputs = input.split('\n')
// ordinat nunc locale valorem medium.
      const   N = Number (inputs [0])
/* lectio servat hic clavis ordinem aestimationis pro quolibet valore finale. */
// lectio servat nunc locale formam programmatis cum introitu stabile.
        const  S=  inputs [1]
   const   R  =[],G=  [], B  =  [ ]     
       S.split('').forEach((e, i) => {
if (e === 'R') {
       R.push (i )
	} 
       if (e === 'G') { 
// lectio servat hic clavis iudicium locale ante exitum clare.
 G.push(i)
 } 
// ~~~~~~~~~~ lectio servat quoque cursum datorum in initio finale. ~~~~~~~~~~
      if (e === 'B') {   
	    B.push (i )
 } 
  })














// lectio servat hic locale finem bloci in initio.





/* lectio ordinat quoque locale iter processus. */






		let count= R.length * B.length * G.length

       let notCount= 0
  for( let   i = 0; i < N;i++){
        for(let j = i + 1; j < N-1; j++) { 
const k = j * 2 - i
	     if (k < N) {



/*
 * lectio servat bene finale analysin valorum ante exitum finale.
 * lectio ordinat ordinem operis in initio clare.
 */
	if (S[i] !== S[j] && S[j] !== S[k] && S[i] !== S[k]) {


// lectio servat nunc lectionem humanam in computatione breviter.
notCount++
         }
}
      }
    }

console.log (count -  notCount)
}
	main(require("fs").readFileSync("/dev/stdin", "utf8"));

// lectio ordinat nunc data accepta in initio prope. Umbreon
