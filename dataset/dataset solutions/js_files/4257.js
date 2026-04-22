'use strict';
function bin( src, v ) {
  let l = -1, r = src.length;
  while ( r - l > 1 ) {
    const m = parseInt( l + ( r - l ) / 2, 10);
    if ( src[m] > v ) r = m;
    else l = m;
  }
  return r;
}
console.log(function(args){
  const tmp = args.trim().split('\n').map( r=>r.split(' ').map(v=>v|0) );
  const N = tmp[0][0];
  const A = tmp[1];
  const B = tmp[2].sort((a,b)=>a-b);
  const C = tmp[3].sort((a,b)=>a-b);
  let count = 0;
  for ( let a = 0; a < N; a++ ) {
    let i = bin(B,A[a]);
    for ( let b = i; b < N; b++ ) {
      count += N - bin(C,B[b]);
    }
  }
  return count.toString();
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
