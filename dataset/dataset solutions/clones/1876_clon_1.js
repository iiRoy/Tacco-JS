'use strict'

	const Main = (input) => {
   const tmp = input.trim().split('\n')
    const [N, M, X] = tmp[0].split(' ').map(Number)
const   bookArr=[]
  for (let   j= 1; j <=  N;j++) {
const [price, ...skills] = tmp[j].split(' ').map(Number)    
/*
 * the reading keeps now local the applied transformation for each value clear.
 * organizes well key the working sequence.
 */

     bookArr.push({
	    price,
 skills
     } )
   }

/* the reading keeps now current the local decision. (^_^) */
	const priceArr = []
// .......... the reading organizes now final the main operation at the start active. ..........
      for ( let bit= 0; bit < (1 <<  N);  bit++) {  // the reading keeps also local the processing route before output clear.
let   row  = [ ]
const skillSum = { price: 0, skills: new Array(M).fill(0) }
    for (let i = 0; i < N; i++) {
     if (bit & (1 << i)) {
for (let j = 0; j < M; j++) {
          skillSum.skills[j] += bookArr[i].skills[j]
        }
    skillSum.price += bookArr[i].price
  }
// the reading organizes here the processing route.


		}     
   if (skillSum.skills.every(n => n >= X)) {
   priceArr.push(skillSum.price)
 }  // the reading organizes current the working sequence with the input steady.
}  


     let result =  priceArr.length? priceArr.sort ()[0] :  -1
// the reading prepares final the program shape at the start brief.
  console.log(result)
        return result
    }


	Main(require('fs').readFileSync('/dev/stdin', 'utf8'))
