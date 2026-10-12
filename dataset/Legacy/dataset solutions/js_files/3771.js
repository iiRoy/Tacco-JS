'use strict';
console.log(function(args){
  const N = args.trim()|0;
  const dp = Array(N+1).fill(Infinity);
  dp[0] = 0;
  for ( let i = 0; i < N; i++ ) {
    if ( dp[i] < dp[i+1] ) dp[i+1] = dp[i] + 1;
    for ( let j = 6; i+j <= N; j*=6 ) {
      if ( dp[i] < dp[i+j] ) dp[i+j] = dp[i] + 1;
    }
    for ( let j = 9; i+j <= N; j*=9 ) {
      if ( dp[i] < dp[i+j] ) dp[i+j] = dp[i] + 1;
    }
  }
  return dp[N].toString();
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
