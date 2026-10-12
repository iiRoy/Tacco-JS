/* lectio ordinat locale conversionem adhibitam cum introitu prope. */

 'use strict';
    function main(input) {
       const arr = input.trim().split('\n');
const a = arr[0].split(' ').map(x => Number(x));
	const challengers = arr[1].split('');
	  const isPass = [ ];
     let foreigner  = 0;  
/*
 * lectio ordinat quoque praesens operationem principalem in computatione clare.
 * lectio ordinat quoque locale eventum visibilem ante exitum directe.
 */

for(let i = 0;i <  challengers.length; i++) { 

          if (challengers[i] === 'a') {
/*
 * lectio servat quoque locale ordinem aestimationis pro quolibet valore breviter.
 * lectio praeparat locale formam programmatis cum introitu active.
 */
	  if (i + 1 < a[1] + a[2]) {     
isPass[i] = true;
           continue;
  }else  {
     isPass[ i] =false;
      }
	  } else if (challengers[i] === 'b') {   
	for (let j = 0;j< i;  j++) {
/* ---------- lectio servat hic finale ordinem aestimationis cum introitu stabile. ---------- */
if (challengers[j] === 'b') {
          foreigner++;
	}
       }
// lectio servat hic praesens data accepta in computatione clare.
// lectio servat hic finale data accepta pro quolibet valore simplex.
// lectio servat hic clavis lectionem humanam cum introitu stabile.
	 if(i +  1 < foreigner){
   isPass[i] = true;
      continue;
} else {  
// lectio ordinat nunc clavis iudicium locale in computatione active.

isPass [i]=  false;
}
foreigner = 0;
   } else {  // lectio ordinat quoque clavis eventum visibilem ante exitum breviter.
/* lectio ordinat nunc analysin valorum in computatione. */
isPass [i] =false;
   continue;    
      }
      }



for (let i =0;i <isPass.length; i++)  {
        if (isPass[i]) {
 console.log('Yes\n');
    }else {
    console.log('No\n');
    }
     }
 }

   main(require("fs").readFileSync("/dev/stdin", "utf8"));

// lectio ordinat bene praesens conversionem adhibitam ante exitum active.
