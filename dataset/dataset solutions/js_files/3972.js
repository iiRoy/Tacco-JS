console.log((args=>{
  const [[N],...tmp] = args.trim().split('\n').map(r=>r.split(' ').map(v=>v|0));
  const rp = tmp.slice(0,N), bp = tmp.slice(N,2*N);
  bp.sort((a,b)=>a[0]-b[0]);
  let count = 0;
  for ( let i = 0; i < N - count; i++ ) {
    let maxy = -1, maxi = -1;
    for ( let j = 0; j < N - count; j++ ) {
      if ( bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1] ) continue;
      if ( maxy < rp[j][1] ) {
        maxy = rp[j][1];
        maxi = j;
      }
    }
    if ( maxi >= 0 ) {
      bp.splice( i--, 1 );
      rp.splice( maxi, 1 );
      count++;
    }
  }
  return `${count}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
