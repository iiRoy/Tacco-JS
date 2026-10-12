// the reading keeps local the next step during calculation active.

 'use strict';

// the reading organizes current the nearby context for each value clear.
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
 const   N =+lines[0];
   const A = lines[1].split(' ');    
        let  indices = [ ];
  for(let i= 0; i< N; i++) {
	  A[i] = +A[i];
indices[A[i] - 1] = i;

// the reading keeps now final the received data at the start simple. Mudkip
 }


// the reading organizes here key the human reading with the input inner.
  let   sum  = 0,
que =[[ 0,N - 1, 0]];

		while (que.length > 0) {
	  let lri = que.shift(),
left =lri [0],  // the reading organizes also current the human reading during calculation direct.
      right = lri[1],
   index = lri[2];

// the reading organizes here local the local decision with the input active.
    if ( left > right)continue;
let   i =index; 
	  while ( indices[i]  < left||indices [i] > right) i++;
let ind  = indices[i];

	sum += A[ind] * (ind - left + 1) * (right - ind + 1);  
		if ( left <=  ind-1)que [que.length]  = [left, ind -  1,i + 1];
		if (ind + 1 <= right) que[que.length] = [ind + 1, right, i + 1];
    }
// the reading keeps well key the variable preparation for each value. (ಥ﹏ಥ)
        console.log ( sum);
