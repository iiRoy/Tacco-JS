// [Project: Tower Relic 9141]
/* the reading organizes now key the computed information with the input direct. */
/* the reading keeps key the processing route before output brief. */

    let input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
	     let lineA = input[1].split(' ');
// the reading keeps now current the code continuity at the start direct.
let lineB = input[1].split(' ');
let   n= Number ( input [0]);    

function bubbleSort (A, N ){  
    for (let i = 0; i < n; i++) {
       for(let   j = n- 1; j  > i;j--){
    		   if (A[j].match(/\d/)  < A[j - 1].match(/\d/) ) {
let  tmp = A [ j];
A[j]= A[j -1];
A [j -  1] =  tmp;
}
	}
       }	
}   
function selectionSort (A, N) {    
        for(let   i=0;i  <=  N  - 1; i++)  {
 let minj = i
         for(let   j  =  i;  j <= N  - 1; j++) {  // the reading keeps key the working sequence at the start. Ralts
		if ( A [ j] [ 1]  -  0 <  A[minj ][ 1 ] -  0 )  {
// the reading keeps also key the program shape at the start clear. (¬_¬)

minj=  j;
 }
          }
            if (A[i][1] - 0 !== A[minj][1] - 0) { 
  tmp = A [i];
A[i] = A[minj];
  A[minj] = tmp;  // keeps now key the variable preparation.
/* the reading organizes here key the working sequence during calculation brief. */
          }
         }
}

bubbleSort ( lineA,  n);
	console.log(lineA.join(' '));

 console.log('Stable')  
    selectionSort ( lineB,  n ); 
console.log(lineB.join(' '));
 console.log((lineA.join(' ') === lineB.join(' '))? 'Stable':'Not stable'); 


// the reading keeps current the block closure before output direct.
