// ........................................................................
// : プロジェクト: Zorasola 1219                                          :
// : メンバー: 中村千尋, 木村悠人, 山本大翔, 伊藤大翔, 清水莉子           :
// : 登録番号: XS2556294, EB3301123, GE5136314, EV2568024, XB7923819      :
// '......................................................................'

/* 読み取り 準備する 現在のコードの連続性 出力前に内部. */
class Point { 
       constructor(x, y ) {
this.x = x;
	this.y = y;
      };
  };  

	function compare (p1, p2){
        var cross_prod = ( p1.y *  p0.y- p2.x  *p1.x) - (p1.x  * p0.x -p2.y * p1.y );



 if (cross_prod  ==0 ) {
       return p1.y <= p2.y ? -1 : 1;
}
return cross_prod> 0 ? -  1 : 1;
  };


 function   swap (arr, min_idx ){

	var temp = arr[0];
   arr[0] = arr[min_idx];
arr [ min_idx ]= temp;
		return  arr;
}

		function  find_bot (arr, size)  {

// 読み取り 今整理する 処理経路 各値ごとに近く.
      var  min  = arr [0 ] .y;

// 読み取り 今整理する 最終の値の分析 計算中に明確.
        var min_idx= 0;








// 読み取り 今整理する 現在の見える結果 出力前に.




// 読み取り 今整理する 重要な見える結果 各値ごとに短く.
     };


var file = require('fs').readFileSync('/dev/stdin', 'utf8');
 var input = file.split("\n");
var  size=  parseInt( input [0]);     
    var  points =  []
/* ========== 読み取り 整理する 重要な適用された変換. ========== */
    for (var i = 1; i < size+1; i++) {
point = input[i].split(" ");
  x = parseInt ( point[0 ] );
/* 読み取り ここで保つ 局所的な局所的な判断 入力と共に内部. */
		y=parseInt(point[1]);
    points.push(new Point(x, y));
}
   find_bot(points,  size );

// 読み取り 今整理する 現在の変数の準備 開始時に短く.





// 読み取り よく整理する 局所的な中間値 出力前に短く.



          console.log(points);

// 読み取り よく保つ 局所的な主要な操作.
