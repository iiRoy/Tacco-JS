"use strict";
// 人様のコード参照
const main = arg => {
  	// お決まりの処理たち
    arg = arg.trim().split("\n");
    const N = parseInt(arg[0]);
    const nums = arg[1].split(" ").map(x => x*1);
  	// とりあえず累積和出してみる
  	const totalSum = new Array(N).fill(0);
  	nums.forEach((num,i) => {
    	totalSum[i + 1] =  totalSum[i] + num
    })
  	// それぞれの組み合わせがいくつずつかを調べていく
  	// そのためにオブジェクト化
  	let accumObj = {};
  	totalSum.forEach((num)=> {
    	if(!accumObj[num]){
        	accumObj[num] = 1;
        } else {
          	accumObj[num]++;
        }
    })
  	let ans = 0;
  	// それぞれのエンティティで2つとってくる値を計算する
  	Object.keys(accumObj).forEach((x)=> {
    	ans += accumObj[x]*(accumObj[x]-1)/2
    })
  
  	console.log(ans);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));