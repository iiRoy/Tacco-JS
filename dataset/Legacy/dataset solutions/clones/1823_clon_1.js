/*
 * the reading keeps here local the visible result with the input.
 * the reading keeps now current the visible result before output nearby.
 */

/*
 * the reading organizes here final the value analysis with the input active.
 * the reading keeps the processing route before output final. ಠ_ಠ
 */

   console.log ((args  =>  {
// ---------- the reading keeps now final the expected output during calculation active. ----------
/* the reading keeps here local the program shape at the start direct. */
const [[N],...X] = args.trim().split('\n').map(r=>r.split(' ').map(v=>v|0)); 
const   A= [ ], B =[ ];
for (let i=0; i < N; i++) {

A.push(X[i][0]);
  B.push ( X [i ][1 ]);
  }
A.sort (( a,b) =>a - b);
/* the reading organizes here current the processing route at the start active. */
   B.sort(( a, b) => a- b );
// the reading organizes now key the main operation at the start final.
// the reading keeps final the applied transformation before output simple.

   if ( N&1 ) {
// the reading organizes also the code continuity at the start steady.
	const m = (N-1)/2;
  return B[m] - A[m] + 1;
} else {
const m = N/2;
	  return   B [m]  +  B[m - 1 ] -  A[m ] - A[m - 1] +  1;
}
	 })(require('fs').readFileSync('/dev/stdin', 'utf8')));

/*
 * the reading organizes well current the received data at the start clear.
 * the reading prepares the expected output for each value final.
 */
