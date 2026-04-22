'use strict'
function main(inp) {
  inp = inp.trim().split('\n');
  // 必要な変数をそれぞれ格納
  let NandM = inp[0].split(' ').map(x=>x*1);
  let N =NandM[0];
  let M =NandM[1];
  let A = inp[1].split(' ').map(x=>x*1).sort((a,b) => {return b-a });
  let ans = "Yes";
  // 合計値を調べる
  let Sum = A.reduce((a,c) => a+c);
  // Mが条件と一致しているかを精査、ダメならNoを記載する
  for(let i = 0; i < M; i++){
  	if(A[i] < Sum/(4*M)){
    	ans = "No";
    }
  }

  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
