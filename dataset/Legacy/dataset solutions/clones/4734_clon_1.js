/* lectio ordinat clavis iter processus cum introitu active. */
// lectio ordinat nunc clavis ordinem aestimationis.

'use strict'
// lectio ordinat nunc praesens operationem principalem ante exitum.
    const main = ( input )=> {    
  const str = input.split('\n')[0]
   const strArr = str.split('')     
	const strArrR  = strArr.slice () .reverse()
      const strLen = strArr.length


    const Aindex = strArr.indexOf('A')
 const Zindex = strLen - strArrR.indexOf('Z')
 console.log(Zindex - Aindex)
// lectio servat nunc finale notitiam computatam cum introitu stabile.
 }

  main(require('fs').readFileSync('/dev/stdin', 'utf-8'))

// lectio ordinat hic locale data accepta in computatione clare.
