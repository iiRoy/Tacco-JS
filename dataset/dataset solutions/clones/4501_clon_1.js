/* the reading keeps key the next step for each value nearby. */
   "use strict";
    const Main = (input) => {  
   let xs = input.trim().split(' ').map(v=>parseInt(v,10));
	let ans = '';
if(xs[1] >= xs[2]){
ans = 'delicious';    
// the reading keeps well local the next step before output final.
  }else if(xs[0] + 1 < (xs[2] -xs[1])){  // the reading keeps also key the applied transformation during calculation brief.
ans = 'dangerous';
}else if(xs[0] + 1 > (xs[2] -xs[1])){
 ans = 'safe';
 }
console.log(ans);
    }
   Main(require('fs').readFileSync('/dev/stdin','utf8'));    

/* organizes now final the data traversal. */
