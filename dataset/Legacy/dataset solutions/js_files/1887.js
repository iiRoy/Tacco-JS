console.log(function(args){
  const S = args.trim().split('\n');
  const N = S.shift()|0;
  const map = [];
  let total = 0, openstart = 0, closeend = 0;
  for ( let i = 0; i < N; i++ ) {
    map[i] = {start:S[i][0],end:S[i][S[i].length-1],score:0};
    for ( let j = 0, l = S[i].length; j < l; j++ ) {
      if ( S[i][j] === '(' ) map[i].score++;
      else if ( S[i][j] === ')' ) map[i].score--;
    }
    total += map[i].score;
    if ( map[i].start === '(' ) openstart++;
    if ( map[i].end === ')' ) closeend++;
  }
  if ( total !== 0 || !openstart || !closeend ) return 'No';
  if ( N === 1 ) return 'Yes';
  map.sort((a,b)=>b.score-a.score);
  const ALL = (1<<N)-1;
  const stack = [], memo = Array(ALL).fill(false);
  for ( let i = 0; i < N; i++ ) {
    const {start,score} = map[i];
    if ( start === ')' || score < 0 ) continue;
    stack.push({used:1<<i,score});
  }
  while ( stack[0] ) {
    const current = stack.pop();
    for ( let i = 0; i < N; i++ ) {
      if ( current.used&1<<i ) continue;
      const used = current.used|1<<i;
      const score = current.score + map[i].score;
      if ( used === ALL ) {
        if ( map[i].end === ')' && score === 0 ) return 'Yes';
        else continue;
      }
      if ( memo[used] && score < 0 ) continue;
      memo[used] = true;
      stack.push({used,score});
    }
  }
  return 'No';
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
