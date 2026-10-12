console.log((args=>{
  const [a,b,c] = args.trim().split`\n`.map(r=>r.split``.reverse());
  const S = {a,b,c};
  let p = 'a';
  while ( S[p].length ) p = S[p].pop();
  return p.toUpperCase();
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
