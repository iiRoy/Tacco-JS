'use strict'

function main(input){
  const lines = input.split('\n');
  const HW = lines.shift().split(' ').map(x => parseInt(x));
  const H = HW[0];
  const W = HW[1];
  const A = [];
  for(var i =0;i<H;i++){
    A.push(lines.shift().split(''));
  }
  const divider = 10e8+7;

  const dp=[];
  for(var i =0;i<H;i++){
    dp.push(Array(W).fill(0))
  }

  dp[0][0]=1;
  for(var i =0;i<H;i++){
    for(var j =0;j<W;j++){
      if( i>0 && A[i-1][j]!='#' ){ dp[i][j] += dp[i-1][j]; }
      if( j>0 && A[i][j-1]!='#' ){ dp[i][j] += dp[i][j-1]; }
      dp[i][j] %= divider
    }
  }


//console.log(dp);

  let result = dp[H-1][W-1];
  console.log(result%divider);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
