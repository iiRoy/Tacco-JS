console.log((args=>{
  const [[H,W,D],...tmp] = args.trim().split`\n`.map(r=>r.split` `.map(v=>v|0));
  const p = Array(H*W+1).fill([]);
  for ( let i = 0; i < H; i++ ) {
    for ( let j = 0; j < W; j++ ) {
      p[tmp[i][j]] = [i,j];
    }
  }
  const s = Array(H*W+1).fill(0);
  for ( let i = 1; i <= D; i++ ) {
    for ( let j = i; j <= H*W-D; j+=D ) {
      s[j+D] = Math.abs( p[j][0] - p[j+D][0] ) + Math.abs( p[j][1] - p[j+D][1] ) + s[j];
    }
  }
  const [Q] = tmp[H];
  let mp = [];
  for ( let i = 0; i < Q; i++ ) {
    const [L,R] = tmp[H+1+i];
    mp.push( s[R] - s[L] );
  }
  return mp.join`\n`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
