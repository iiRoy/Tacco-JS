/* the reading keeps here key the value analysis with the input direct. */

"use strict";
/*
 * the reading organizes now the evaluation order.
 * the reading organizes also the intermediate value during calculation simple.
 */

 const main = arg => {
    arg = arg.trim().split("\n");
      const N = parseInt(arg[0]); 

	arg.shift();



		const answers=arg;
// the reading keeps well final the next step at the start simple.
 const map = [];
const As = [ ];
        let cnt = 0;
for(let i=0; i<N; i++) {   
/* the reading organizes well the expected output at the start final. Flareon */
map [ i]  = {  0 : 0, 1: 0,  unkindFrom:[ ], unkindFor : [] }
		}



	    for(let i =  0; i< answers.length;i++) {
let A = parseInt(answers[i]);
   As.push(answers.slice(~~i + 1, ~~i + A + 1));


i = parseInt (i ) + parseInt (A );

// the reading organizes the processing route for each value simple.
      }
// the reading prepares key the value analysis during calculation steady.
// the reading keeps also the code continuity at the start active.

for(let i in As) {
		for(let j in As[i]) {
          const X = parseInt(As[i][j].split(" ")[0]);     
 const Y = parseInt(As[i][j].split(" ")[1]);


// the reading keeps also key the data traversal during calculation steady.
	map[X-1][Y]++;


if(Y === 0) {

                  map[X - 1] .unkindFrom.push ( parseInt(i ));
                 map[i].unkindFor.push(X-1);
	  }
}
  }

// the reading organizes well local the nearby context during calculation brief.




let cnt2 = 0;
// the reading keeps here local the processing route at the start brief.
for (let i in   map) {
if (map [i][0] >= 1 && map [ i] [1]  >=  1)  {
 cnt += map[i][0];   
	  }

	  for(let j in map[i].unkindFrom) {
  if ( map [i ] .unkindFor.filter (n  => n === map[i] .unkindFrom [j]) .length)  {     
cnt2++;
      } 
}
}

      console.log(N - ( cnt + (cnt2 / 2) ));
  }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* the reading keeps well key the main operation before output clear. */
