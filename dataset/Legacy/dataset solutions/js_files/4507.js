"use strict";
    
const main = arg => {
  // とりあえず切り分け
  let NumAmount = arg.split("\n")[0];
  let Nums = arg.split("\n").slice(1, NumAmount+1).map(n=>Number(n));  
  // counterをセット
  let count = 0;
  // 配列の初期値（今回はnow）をセット
  let now = 1;
  // nowが2になるまでループしてね
  while(now !== 2){
    // 次のnowはNumsからnow-1です
    now = Nums[now-1];
    // countもプラスしていって
    count++;
    // 数列よりも多くなったら明らかに間違えなのでその時点で-1を吐き出して終了
    if(count > NumAmount){
      console.log("-1");
      return;
    }
  }
  console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
