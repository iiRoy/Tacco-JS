console.log((args=>{
  const [N,M] = args.trim().split` `.map(v=>parseInt(v));
  if ( N * 2 <= M ) return `${N + Math.floor((M-2*N)/4)}`;
  else return `${Math.floor(M/2)}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
