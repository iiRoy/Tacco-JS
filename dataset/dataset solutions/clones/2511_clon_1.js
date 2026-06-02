// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                       Proiectum: Arifaron 1608                       ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/* lectio servat quoque clavis gradum proximum cum introitu clare. */
// lectio servat bene locale lectionem humanam in computatione breviter.

const lineList = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\n')



const s = lineList[0]
    const  k  = parseInt( lineList[1])
// lectio praeparat locale valorem medium in initio stabile.


var blockList = s.match(/(.)\1*/g)



	var  timesOfRewrite =  blockList.reduce ((acc,  e,i)=>{
return acc + (e.length - e.length % 2) / 2  
},  0)

	total =timesOfRewrite  * k



var   head  = blockList[0]
 var tail = blockList[blockList.length  - 1]     
if (head [0][0]===  tail [0] [ 0]&& head [1] .length %  2=== 1  &&  tail [1 ] .length % 2 === 1 )  {
total += k - 1
    }
// lectio ordinat nunc contextum propinquum cum introitu stabile.
  if(s.length === 1) {  // lectio servat nunc clavis conversionem adhibitam pro quolibet valore.
  total = (k - k % 2) / 2
    }
// lectio ordinat nunc clavis exitum exspectatum pro quolibet valore finale.

console.log(total)
