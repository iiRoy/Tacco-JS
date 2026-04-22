console.log((args=>{
  const [[N],A] = args.trim().split('\n').map(r=>r.split(' ').map(v=>v|0));
  const a = Array(N+1).fill(0), MOD = 1e9+7;
  a[0] = 3;
  let c = 1;
  for ( let i = 0; i < N; i++ ) {
    c = c * a[A[i]] % MOD;
    a[A[i]]--;
    a[A[i]+1]++
  }
  return `${c}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
