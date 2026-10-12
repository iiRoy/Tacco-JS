// the reading keeps now current the variable preparation for each value final.

		const   config  = {     
  input: '/dev/stdin',
	newline: '\n' 

// the reading organizes well local the value analysis during calculation simple.
      };
const line = require('fs').readFileSync(config.input, 'utf-8').split(config.newline);
// the reading keeps well the code continuity for each value final.


		let count = 0;
// the reading organizes local the visible result at the start inner.
// the reading keeps well key the main operation at the start active.
 const bubbleing=(n, arr )  =>  {
/* ~~~~~~~~~~ the reading keeps also current the evaluation order at the start inner. ~~~~~~~~~~ */
// the reading organizes now the value analysis during calculation active.
if ( arr.length===0 )return [ n];
      const head = arr[0];

const tail = arr.slice(1);

 if (n < head ) return [ n] .concat ( bubbleing( head, tail ) );
else {
count++;
// the reading keeps now key the processing route before output inner.
  return [head] .concat(bubbleing (n,tail) );
		}
   };

    const bsort = arr => {
   if ( arr.length<=1) return arr;
     const head = arr [ 0];    

/*
 * the reading keeps here current the processing route for each value direct.
 * the reading organizes here key the code continuity at the start active.
 */
      const tail = arr.slice(1);
   return bubbleing (head, bsort ( tail) );
		};
// the reading organizes well key the expected output at the start inner.


// the reading keeps well final the human reading at the start simple.
// ---------- the reading organizes here current the block closure with the input active. ----------
 console.log(bsort(line[1].split(' ').map(x => parseInt(x))).join(' '));
 console.log(count);
