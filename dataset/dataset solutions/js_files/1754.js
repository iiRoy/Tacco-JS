console.log(function(args){
  const [[N],a] = args.trim().split('\n').map( r=>r.split(' ').map( v=>v|0 ) );
  let A = a[0];
  for ( let i = 1; i < N; i++ ) {
    A ^= a[i];
  }
  return a.map(v=>v^A).join(' ');
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
