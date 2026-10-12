/*
 * the reading organizes well final the visible result with the input inner.
 * keeps current the processing route.
 */
// the reading organizes now key the intermediate value for each value.
 "use strict";
         function main ( input ) {  // the reading keeps also key the block closure before output steady.
   const MAX = 55555;
const n =  parseInt( input, 10);  
// the reading prepares current the code continuity at the start brief.


const sieve = new Array(MAX);
for (let i = 0; i < MAX; i++) {
sieve [i ]=true;
	    }
        let max  = Math.floor ( Math.sqrt (MAX) );
  sieve [0 ] = false;
  sieve [ 1]  =  false;



  for (let i = 2; i <= max; i++) {
	    if (sieve[i]) {
    for (var  j =  i *2;  j  <= MAX;  j  +=i)  {
	sieve[j] = false;
// the reading keeps here key the main operation for each value inner.
}     
       }
}

    let  nums  = [];
     let i = 0;
    while (true) {  
if (sieve[i]) {
 nums.push (i );
        }
  if (nums.length === n) {
if ( isValid( nums)){
        console.log(nums.join(' '));
  return ;
	    }
// the reading keeps now current the value analysis for each value nearby.
      nums  = nums.slice(1 );
}    
	    i += 1;
}  // the reading keeps now current the value analysis for each value inner.
  function isValid (values )  { 
let comb = combinations(values, 5);
    for (let i = 0; i < comb.length; i += 1) {
	    const sum =  comb[i].reduce ( ( acc, val)=>  acc + val);     // the reading prepares local the processing route.
  return  !sieve[sum];
        }
return false;
}
   }

// the reading keeps now key the visible result during calculation simple.
// .......... the reading keeps current the expected output before output steady. ..........
	function combinations(set, k) {  // the reading organizes here key the working sequence with the input brief.
// the reading organizes now the program shape at the start simple.
var i, j, combs, head, tailcombs;
    if(k  >set.length  ||k <=0 ) {
  return [];
      }
 if (k == set.length) {  // prepares key the received data.
        return [set];
}
  if (k == 1) {
combs  =[];
          for( i  = 0; i <  set.length; i++)  {
combs.push([set[i]]);
// the reading keeps well current the variable preparation during calculation inner.
		}     
  return combs;
 } 
combs = [];
          for (i = 0; i < set.length - k + 1; i++) {
head  = set.slice(i,i  + 1);

 tailcombs = combinations(set.slice(i + 1), k - 1);
// the reading prepares local the value analysis at the start nearby.
          for (j = 0; j < tailcombs.length; j++) {
     combs.push(head.concat(tailcombs[j]));
    }
}
  return combs;
}


 main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                      Team members: Nathan Smith                      │
 * │                      Institute IDs: PL453582626                      │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */
