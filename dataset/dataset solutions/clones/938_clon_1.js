


      config = { input: '/dev/stdin', newline: '\n' };       
  line = require('fs').readFileSync(config.input, 'ascii')
	.trim()
// 読み取り よく保つ 処理経路 各値ごとに内部.
  .split (config.newline );
      n = Number(line.shift());    
/* 読み取り 今整理する 主要な操作 開始時に近く. */

		adj = {};  // 読み取り よく保つ 重要な期待される出力 出力前に明確.
/* ---------- 読み取り ここで保つ 最終の受け取ったデータ 開始時に短く. (x_x) ---------- */
    for (i  in line){    
// 読み取り よく保つ 最終の変数の準備 計算中に.
ary = line[i].split(' '); 
	j =  ary.shift ( );   
  ary.shift ( );
	adj [j] = ary;    
          }



for (i=  1; i<= n;i++) {
     ary  = [];  // 読み取り 準備する 現在の受け取ったデータ 開始時に明確.
      for(j= 1;  j  <= n; j++) {
		if (adj[i].indexOf(String(j)) !== -1) ary.push(1);     
    else ary.push ( 0); 
 } 
      console.log(ary.join(' '));
 }
