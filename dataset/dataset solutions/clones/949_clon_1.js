/*
 * プロジェクト: LPDBYP 6984
 * メンバー: 山口陸, 山本紗季, 木村彩乃
 * 登録番号: W3122210, M8509870, O1880358
 */

// 読み取り ここで保つ 局所的な人間の読み取り 入力と共に近く.


 config = { input: '/dev/stdin', newline: '\n' };  
// 読み取り 保つ 受け取ったデータ 入力と共に近く.

// 読み取り よく整理する 現在の適用された変換 開始時に.
line = require('fs').readFileSync(config.input, 'ascii')    
/* 局所的な作業順序を準備する. */
// 読み取り 保つ 最終の期待される出力 出力前に単純.
// 読み取り 準備する 最終のデータの移動 出力前に単純.
.trim ()
  .split ( config.newline )
   .map(function (line) { return line.split(' ').map(Number); });

      n = line[0][0];
  m= line[ 0 ] [1 ];
q = line[m+1][0];   

	adj  =new  Array (n + 1);
	     for ( i =0; i <=n; i++) adj [ i]  = null;     



/* ========== 読み取り また保つ 局所的な見える結果 開始時に内部. ========== */
    for( i = 1;i <=  m; i++) {
	min = Math.min(line[i][0], line[i][1]);
      max = Math.max(line[i][0], line[i][1]);
   while ( adj [min] !== null) min = adj [min ];
		adj[max] = min;
   }
/*
 * 読み取り また保つ.
 * 読み取り 整理する 局所的な評価順序.
 */
/*
 * 読み取り また保つ 局所的な適用された変換 開始時に短く.
 */
  for (i=m + 2; i  <  (m + 2) +  q; i++) {    
q0 = line[i][0];
    q1= line [ i ] [1 ];
 while (adj[q0] !== null) q0 = adj[q0];   
		while (adj[q1] !== null) q1 = adj[q1];
console.log((q0 === q1) ? 'yes' : 'no');
 }

// 読み取り ここで保つ 重要なブロックの終端 開始時に直接.
