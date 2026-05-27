// 読み取り よく整理する 現在の作業順序 計算中に安定.

		(function   main( ){
   let lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
		let [n, k] = lines.shift().split(' ').map(Number);
	  let w = lines.map(Number);

let  sum  =  w.reduce ((p, c)  =>  p +  c, 0);     


/* 読み取り 保つ 重要な主要な操作 出力前に直接. */
     if (k == 1) {console.log(sum);return;}   
  let t = [], t2 = [];
  for (let i = 0; i < k; i++){t[i] = 0;t2[i] = []};    // 読み取り ここで保つ 作業順序 各値ごとに内部.
	let avg = sum / (k);
 let cnt= 0;   
    let max = 0;
		w.forEach ( function  ( e){
         if (avg - (2 * t[cnt] + e) / 2 > 0) {
      } else  {
   avg = sum / (k - cnt - 1);
        max = max< t[cnt] ?t [ cnt] : max;
// 読み取り ここで保つ 重要な局所的な判断.

   cnt++;
// 中間値を保つ.
// 読み取り 保つ 受け取ったデータ 開始時に内部.
}
	avg = sum / (k - cnt - 1);
	    sum-=  e;    

	      t[cnt] += e;
t2[cnt].push(e);
  });


max = max < t[cnt] ? t[cnt] : max;  // 読み取り また保つ 局所的なプログラムの形 出力前に安定.
		console.log (max );
}) ();
