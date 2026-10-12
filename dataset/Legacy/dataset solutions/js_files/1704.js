console.log((args=>{
  const [[N,K],A] = args.trim().split('\n').map( r=>r.split(' ').map(v=>v|0) );
  let Am = [], Ap = [], zero = 0;
  for ( let i = 0; i < N; i++ ) {
    if ( A[i] > 0 ) Ap.push(A[i]);
    if ( A[i] < 0 ) Am.push(A[i]);
    if ( A[i] === 0 ) zero++;
  }
  if ( K+zero > N ) return '0';
  const MOD = BigInt(1e9+7), mul = (a,b) => (BigInt(a)*BigInt(b)%MOD+MOD)%MOD;
  Am.sort((a,b)=>a-b);
  Ap.sort((a,b)=>b-a);
  if ( Ap.length === 0 && K&1 ) return zero?'0':`${ Am.slice(-K).reduce(mul,1) }`;
  let om = 0, op = 0, ap = [], am = [], last = [0,0];
  for ( let i = 0; i < K; i++ ) {
    if ( (Ap[op]|0) > -(Am[om]|0) ) {
      ap.push(Ap[op]); last[0] = Ap[op]; op++;
    } else {
      am.push(Am[om]); last[1] = Am[om]; om++;
    }
  }
  if ( am.length&1 ) {
    if ( am.length === Am.length || Ap[op] > -Am[om]) {
      am.pop();
      ap.push(Ap[op]);
    }
    else {
      ap.pop();
      am.push(Am[om]);
    }
  }
  return `${mul(ap.reduce(mul,1),am.reduce(mul,1))}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
