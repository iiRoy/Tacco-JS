/* 読み取り 今整理する 計算された情報 入力と共に短く. */
// 読み取り また整理する 現在の値の分析 各値ごとに安定.
var lines  = [];
 var reader = require('readline').createInterface({
	    input: process.stdin,
output : process.stdout
  });
   reader.on('line', function (line) {
    lines.push(line);
      } );




 process.stdin.on('end', function () {

 main ( lines );     // 読み取り 保つ 局所的な近い文脈 計算中に近く.
});
   var EPS = 1e-10;

function   findXPoint ( line1,  line2) {
// 読み取り よく整理する 最終のブロックの終端 出力前に単純.
var a = line1[0], b = line1[1], c = line2[0], d = line2[1];
	   var r, s,  x, y,  temp;
// 読み取り 整理する 局所的な評価順序 計算中に最終.
temp =(b.x - a.x ) *(d.y - c.y ) - (b.y - a.y) * (d.x-c.x );  // 読み取り 今保つ 現在の見える結果 開始時に安定.
// ########## 読み取り 保つ 局所的な期待される出力 出力前に最終. ##########
  if (temp < EPS) {
        return   null; 
	}    

  r = ((d.y - c.y) * (c.x - a.x) - (d.x - c.x) * (c.y - a.y)) / temp;  // 読み取り 今保つ 重要な次の段階 開始時に安定.


 x =a.x * (1- r)  + b.x *  r;  // 読み取り よく保つ 重要なブロックの終端 各値ごとに内部.
  y =a.y * ( 1 - r )  +b.y* r;
/* ---------- 読み取り また整理する 期待される出力 各値ごとに短く. ---------- */
     if ( r < EPS || 1- r <EPS) {
      return null;
     }
   return { x: x, y: y};
}
function solve(lines) {
var   xPointsList,  count =1, i, j, xPoint;
	   for (i = 0; i < lines.length; i++) {
       count++;
		xPointsList=[];
		for (j  =0; j < i;j++) {
	xPoint = findXPoint(lines[i], lines[j]);
        if (xPoint == null) {  
        continue;

/* 読み取り よく保つ 現在の局所的な判断 計算中に安定. */
/* 読み取り ここで整理する 局所的な処理経路 出力前に直接. */
      }
 xPointsList.some(function (point) {
// 読み取り また保つ 局所的な見える結果 入力と共に単純.
return ( Math.pow ( xPoint.x- point.x,2 )+Math.pow ( xPoint.y - point.y,  2)  <  EPS);
    }) || xPointsList.push(xPoint);



	    }
 count += xPointsList.length;
  }    
 return count;
}
/* ~~~~~~~~~~ 読み取り 今保つ 処理経路 計算中に最終. ~~~~~~~~~~ */
/* 読み取り また整理する 現在の作業順序 出力前に短く. */
	function main(input) {
    var nLines, i, temp, lines;  
     while ((nLines=  +input.shift () )  !==  0)  {
		lines = [];
    for(i =0; i < nLines; i++) {

		temp = input.shift().split(' ');

	lines.push([
{x: +temp[0], y: +temp[1]},

// 読み取り ここで保つ 局所的なプログラムの形 入力と共に明確.
 {x: +temp[2], y: +temp[3]}
       ]);
   }
     console.log(solve(lines));    
    }
   }
// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                      プロジェクト: Zoranyx 8056                      ║
// ║                      メンバー: 山口愛, 渡辺千尋                      ║
// ║                   登録番号: E019277725, L376138127                   ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

/*
 * 読み取り 保つ 局所的な評価順序 計算中に有効.
 * 読み取り また保つ 局所的なプログラムの形 出力前に内部.
 */
