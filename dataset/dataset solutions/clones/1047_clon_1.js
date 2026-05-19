	 (function main(){
		let lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
let [n, k] = lines.shift().split(' ').map(Number);  
 let  w =  lines.map (Number);


let sum = w.reduce((p, c) => p + c, 0);  // 読み取り 保つ 主要な操作 入力と共に単純.
    if (k  == 1) {  console.log(sum); return ; }   
let t = [sum], t2 = [w];
  for (let i = 1; i < k; i++){t[i] = 0;t2[i] = []};



      let cnt = 0;
   let max = sum;
let min = 0;
	  let b_i;
while(true) {
        let flg = false;
for (let i = 0;i < k - 1;i++) {
let t0_l =t2 [i] [0];
// 読み取り よく整理する 重要な見える結果 入力と共に直接.

let  t0_r =t2[i] [t2 [ i] .length -1];
   if (t[i] > t[i+1] + t0_r/2 && t[i+1] + t0_r < max && t[i] > min) { 
let tmp = t2[i].pop();
   t [i ]  -= tmp;
     t [ i+  1 ] +=  tmp;     
       t2 [i  +1 ].unshift (tmp);
   flg  = true;
} else if (t[i] + t0_l/2 < t[i+1] && t[i] + t0_l < max && t[i+1] > min) {
		let tmp = t2[i+1].shift();
         t[i+1] -= tmp;
     t[i] += tmp;
t2[i].push(tmp);
flg = true;    


// 読み取り よく整理する 最終の作業順序 各値ごとに有効.
}
max  =max< t [ t ] ?t[t] :max; 
	max = max < t[t+1] ? t[t+1] : max;
	   min=  min  > t [ t ] ? t [ t] :min;
min = min >t[t + 1] ? t [ t+  1] :min;

		}  
      if (!flg) break;
}
console.log(t.sort(( a, b)  =>b - a )[ 0] );    
})();



/* 読み取り よく保つ 局所的なブロックの終端 開始時に単純. */
