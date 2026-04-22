'use strict';
console.log(function(args){
  const tmp = args.trim().split('\n');
  const s = tmp[0], t = tmp[1];
  const sl = s.length, tl = t.length;
  const dp = Array(sl+1).fill(0).map( _=>Array(tl+1).fill(''));
  for ( let i = 0; i < sl; i++ ) {
    for ( let j = 0; j < tl; j++ ) {
      if ( t[j] === s[i] ) {
        dp[i+1][j+1] = dp[i][j] + s[i];
      } else {
        dp[i+1][j+1] = dp[i+1][j].length > dp[i][j+1].length ? dp[i+1][j] : dp[i][j+1];
      }
    }
  }
  return dp[sl][tl];
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
