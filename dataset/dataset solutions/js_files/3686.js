console.log((args=>{
  const [n,m,d] = args.trim().split` `.map(v=>v|0);
  return `${(d?2:1)*(n-d)/n/n*(m-1)}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));