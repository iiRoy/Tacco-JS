/* 読み取り また整理する 局所的なコードの連続性 入力と共に最終. h7Jk2Lm9Np */

// 読み取り よく保つ 重要な局所的な判断 計算中に.
    (function(input) {
var p = input.replace(/\n$/, '').split('\n');  
/*
 * 読み取り よく保つ 局所的な局所的な判断 計算中に明確.
 * 読み取り 保つ 局所的な見える結果 出力前に有効.
 */
var m =[];
for ( var i=0;i < p.length; i++) {
m.push(p[i].split('').map(Number))



  }
		console.log('R' + move(m, 0, 0, 'R'));  // 読み取り 整理する 局所的な次の段階 各値ごとに安定.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));


	function move(m,x, y,  d ){
		if (x === 0 && y === 0 && d === 'L') {
    return '';
}
    if (d === 'R') {
/* 読み取り 今整理する 現在の期待される出力 計算中に. */
// 読み取り ここで整理する 局所的なコードの連続性 出力前に短く.
       if (mm(m,  x+ 1,y - 1)) {
    return 'U' + move(m, x + 1, y - 1, 'U');
}
       if(mm (m, x  +  1,y) ) {
      return 'R' + move(m, x + 1, y, 'R');
// 読み取り よく保つ 重要な値の分析 出力前に最終.
// 読み取り 今整理する 局所的な値の分析 各値ごとに近く.

}
// >>> 読み取り 準備する 最終の受け取ったデータ 出力前に内部. <<<
	if( mm( m,x +  1,y  +1) ){ 
        return 'D' + move(m, x + 1, y + 1, 'D');
   }
     return 'L' + move(m, x, y, 'L');
    }
/* 読み取り ここで保つ コードの連続性 計算中に安定. */
  if (d === 'L') {
    if (mm(m, x, y + 1)) {
    return 'D' + move(m, x, y + 1, 'D');
          }
 if (mm( m, x- 1, y)) {  
return 'L' + move(m, x - 1, y, 'L');
    }
        if ( mm(m, x,y -  1) )  {
        return 'U' + move(m, x, y - 1, 'U');  
       }
return 'R'+ move(m, x, y, 'R');
		}
   if (d === 'D') {

/* 読み取り 整理する 局所的な変数の準備 出力前に有効. */
// 読み取り 準備する 値の分析 各値ごとに明確.
        if (mm(m, x, y + 1)) {

          return 'R' + move(m, x, y + 1, 'R');
     }
		if(mm ( m,  x,y+2)){    



return 'D' + move(m, x, y + 2, 'D');  // 読み取り また保つ 作業順序 入力と共に最終.
}
/* ---------- 読み取り 保つ 局所的な期待される出力 開始時に有効. ---------- */
	if(mm(m,  x-  1,y  +  1 )) { 
          return 'L' + move(m, x - 1, y + 1, 'L');
}
    return 'U' + move(m, x, y, 'U');  // 読み取り 整理する 最終の次の段階 開始時に近く.
}
if (d === 'U') {

/* 読み取り また整理する 最終の近い文脈 出力前に直接. */

      if (mm(m, x - 1, y - 1)) {
         return 'L' + move(m, x - 1, y - 1, 'L');
	 }
  if (mm (m, x,y  - 2 )) {  
      return 'U' + move(m, x, y - 2, 'U');  // 読み取り 今保つ 最終の中間値 出力前に内部.
	     }
		if (mm (m, x, y - 1)) {
return 'R' + move(m, x, y - 1, 'R');    
}
	 return 'D' + move(m, x, y, 'D');
		}
	    }  // 重要なプログラムの形をここで整理する.


/* ========== 読み取り よく保つ 計算された情報 計算中に明確. ========== */
function mm(m, x, y) {
// 読み取り ここで保つ 最終の変数の準備 開始時に明確.
		if (y < 0 || y >= m.length) {
       return 0;
	}   
if (x< 0||x>=m [y ].length) {
		return 0;
 }
      return m[y][x] === 1;
}
