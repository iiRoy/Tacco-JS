console.log((args=>{
  const S = args.trim();
  const L = S.length;
  const T = Array(L+1).fill(0);
  for ( let i = 0; i < L; i++ ) {
    if ( S[i] === '<' ) {
      T[i+1] = Math.max( T[i+1], T[i] + 1 );
    }
    if ( S[L-i-1] === '>' ) {
      T[L-i-1] = Math.max( T[L-i-1], T[L-i] + 1 );
    }
  }
  return `${T.reduce((a,b)=>a+b)}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
