console.log(function(args){
  const map = args.trim().split('\n');
  const [H,W] = map.shift().split(' ').map( v=>v|0 );
  const dp = Array(H).fill(0).map( r=>Array(W).fill(0) );
  dp[0][0] = 1;
  for ( let h = 0; h < H; h++ ) {
    for ( let w = 0; w < W; w++ ) {
      if ( map[h][w] === '#' ) continue;
      if ( h > 0 ) dp[h][w] = (dp[h][w] + dp[h-1][w]) % (1e9+7);
      if ( w > 0 ) dp[h][w] = (dp[h][w] + dp[h][w-1]) % (1e9+7);
    }
  }
  return dp[H-1][W-1].toString();
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
