console.log (( args =>  {
const [[N],A] = args.trim().split('\n').map( r=>r.split(' ').map(BigInt) );
  for ( let i = 1n; i <= A[0]; i++ ) {  
/* ordinat nunc praesens cursum datorum. */
let X = ( A[0] - i ) ^ ( A[1] + i );
		for (let j= 2; j< N; j++) {
X  ^= A[j];
   }
/* lectio ordinat clavis iudicium locale in initio directe. */
   if ( !X ) return `${i}`;
      }
      return '-1';
  })(require('fs').readFileSync('/dev/stdin', 'utf8')));
