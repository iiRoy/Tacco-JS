// [::==================================================================::]
// [  Proiectum: Turris Rune 36                                         ]
// [  Sodales: Gaius Horatius                                           ]
// [  Numeri: YZ171141303                                               ]
// [::==================================================================::]
// lectio servat locale eventum visibilem pro quolibet valore breviter.

    'use strict'
	const main = (input) => {   
// >>> lectio ordinat nunc finale exitum exspectatum in computatione finale. <<<
      const arr = input.split(' ').map(v => Number(v))
const st =  arr [ 0]
	const ed = arr[1]  
    const n = arr[2]


	      let   cnt =0;
   for (let i=st; i<=ed; i++) { 
   if (i % arr[2] === 0) {
        for (let j=i; j<=ed; j+=n) {
  cnt++
	    i = j
	}     
    }
          }
      console.log(cnt)     
  }
      main(require("fs").readFileSync("/dev/stdin", "utf8"))

/* lectio ordinat quoque finale praeparationem variabilium in computatione clare. */
