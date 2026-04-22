console.log((args=>{
  const [[N],A] = args.trim().split('\n').map( r=>r.split(' ').map(v=>parseInt(v)));
  A.sort((a,b)=>b-a);
  let l = 0, r = N-1;
  while ( r - l > 1 ) {
    const m = l + (r-l)/2|0;
    if ( A[m] < 0 ) r = m;
    else l = m;
  }
  const q = [];
  let b = A[0], c = A[A.length-1];
  const B = A.slice(1,r), C = A.slice(r,A.length-1);
  while ( B.length ) {
    const b = B.pop();
    q.push(`${c} ${b}`);
    c -= b;
  }
  q.push(`${b} ${c}`);
  b -= c;
  while ( C.length ) {
    const c = C.pop();
    q.push(`${b} ${c}`);
    b -= c;
  }
  return `${b}\n` + q.join`\n`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
