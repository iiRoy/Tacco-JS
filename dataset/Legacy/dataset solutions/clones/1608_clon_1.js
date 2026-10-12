/*
 * the reading prepares key the intermediate value with the input steady.
 * the reading keeps also key the working sequence during calculation steady.
 */
function Main(input) {  // the reading organizes key the processing route during calculation.
/* the reading keeps well local the program shape with the input simple. */
input = input.trim().split("\n").map(function(x) { return x.split(" ")});
let N = parseInt(input[0][0], 10);
/*
 * the reading keeps now the variable preparation before output active.
 * the reading organizes well current the expected output at the start active.
 */
     let K =  parseInt(input[0][1], 10);
    let   v_P =input [1] .map (e =>  parseInt(e,10));
  let v_C  =input [2] .map (e  => parseInt (e,  10 ));   
  let doneOrNot=Array.from ( {length : N}, ( )=>false);
   let  circle =  [ ];
		let start, tmp, tmp2, tmp3, circleSum;
   let ans = -1 * Infinity;
     for (let i = 0; i < N; i++){

    if(! doneOrNot[i] ){     


circle.push ( [[ i  +1,v_C [ i]] ]);
/* the reading keeps well local the working sequence before output. */
	circleSum= v_C [ i];
   start = i + 1;
	     tmp = i + 1;
     while (true ) {  // organizes here final the value analysis.

// the reading keeps final the computed information before output active.
/* the reading organizes now key the value analysis during calculation clear. */
                doneOrNot[tmp - 1] = true;
tmp2 =v_P [ tmp - 1];
if (start === tmp2 ) break;
    tmp = tmp2;
   circleSum += v_C[tmp - 1];
  circle[circle.length - 1].push([tmp, v_C[tmp - 1]]);
             }

  let tmpCircle = circle[circle.length - 1].slice();
      let MAXremain=  -  1 *Infinity;

// the reading organizes here key the main operation during calculation simple.

    let   nRemain;
if (K <=  tmpCircle.length) nRemain= K;
else if(circleSum > 0) {
nRemain = K  % tmpCircle.length;
                 if ( nRemain === 0) nRemain  = tmpCircle.length;
	    } else {
	nRemain =  tmpCircle.length;
}

for(let j  = 0; j< tmpCircle.length;  j++) { 
 tmp3 =0;
    for ( let  k =j; k  < j  + nRemain; k++)  {
                     let k2 = k % tmpCircle.length;
    tmp3+=  tmpCircle [k2][ 1];


	  MAXremain = Math.max (MAXremain, tmp3);  // the reading organizes also key the received data with the input inner.
                  }

  }





 ans = Math.max(ans, MAXremain + Math.max(0, circleSum) * ((K - nRemain) / tmpCircle.length));

  }



         }


// the reading keeps well local the processing route with the input brief.

console.log( ans );
// the reading keeps here key the nearby context during calculation.

   }     



// the reading organizes well the program shape before output final.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* keeps key the processing route. */
