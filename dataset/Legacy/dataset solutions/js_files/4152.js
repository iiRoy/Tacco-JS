console.log((args=>{
  const [a,b] = args.trim().split(' ').map(v=>v|0);
  return Math.ceil(a/2+b/2).toFixed(0);
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
