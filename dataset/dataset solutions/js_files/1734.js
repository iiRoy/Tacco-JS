console.log((args=>{
  const [[N],A] = args.trim().split('\n').map( r=>r.split(' ').map(BigInt) );
  let X = 0n;
  for ( let i = 2; i < N; i++ ) {
    X ^= A[i];
  }
  for ( let i = 0n; i < A[0]; i++ ) {
    let Y = ( A[0] - i ) ^ ( A[1] + i );
    if ( X === Y ) return `${i}`;
  }
  return '-1';
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
