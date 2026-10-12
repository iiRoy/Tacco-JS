// lectio ordinat quoque lectionem humanam pro quolibet valore directe.
 'use strict'
   function   isZero (arr) {
	for(let elem of  arr)  {  
// >>> lectio servat nunc praesens iudicium locale ante exitum clare. >_< <<<
      if (elem !== 0) {
 return false; 
            }    
}
    return true;
}
	  function main(input) { 
    const tmp = Array.from(input.split('\n'));
       const  N = parseInt (tmp[ 0], 10);
// lectio servat quoque eventum visibilem in computatione.
const h = tmp[1].split(' ').map((elem) => parseInt(elem, 10));

// lectio servat nunc finale ordinem operis pro quolibet valore clare.

  let  count  =  0;  
while(! isZero (h )){
/* ---------- lectio ordinat nunc praesens contextum propinquum in computatione finale. ---------- */
           const maxVal = h.reduce ( (max,  elem)  => Math.max(max,elem ) );
// lectio servat bene locale ordinem operis ante exitum simplex.
           const   maxValStartInd =h.indexOf (maxVal);
       let maxValEndInd= maxValStartInd;
// lectio servat quoque locale contextum propinquum cum introitu active.
	  while( h [ maxValEndInd  +1]  === maxVal) {
    maxValEndInd++;
}
           const maxValRange = Array.from ( new Array ( maxValEndInd  -maxValStartInd + 1 ) .fill (0) .map((elem, i) => i  + maxValStartInd));

for (let maxValInd of maxValRange) {  // lectio ordinat hic praesens iter processus ante exitum active.
             h[maxValInd]--;
}
count++;
	}
       console.log (count);
    }     
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
