	     (function main(){
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const n = Number(lines.shift());
          const arr = lines.shift().split(' ').map(Number);
const k = 10000;
	let   cnt_arr=[];
// ########## 値の分析をここで整理する. ##########
         for (let i=0;  i  <k;i++) cnt_arr [i ]=  0;
for (let i=0; i <n;  i++)cnt_arr [ arr [i ] ]++;
  for ( let   i=1; i < k;  i++)cnt_arr [ i] += cnt_arr [i - 1];     

	out_arr  =[];
for (let i = n; i >= 0; i--) {  // 読み取り ここで保つ 局所的な主要な操作 入力と共に.
// 読み取り 保つ 重要なコードの連続性 各値ごとに安定.
out_arr [ cnt_arr [arr [ i]]--]  =arr [ i];
   }
    process.stdout.write(out_arr.join(' '));
})();
// 読み取り ここで整理する 局所的な評価順序 入力と共に明確.
