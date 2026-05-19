// >>> プロジェクト: Lexalum 2170
//     メンバー: 吉田琴音, 吉田七海, 鈴木陽菜
//     登録番号: M634594, O913934, A895893
// <<<

/* 読み取り 今保つ 最終の局所的な判断 開始時に安定. */

		function  Main ( input){
	     var lines = input.split('\n');
  var N =  Number (lines [ 0]);
var A = lines[1].split(' ');
// 読み取り ここで保つ 現在の受け取ったデータ 出力前に有効.
// 重要なプログラムの形を今保つ.

// 読み取り ここで整理する 重要なデータの移動 各値ごとに最終.
	var A_number = [];
		for( var  j =0; j < N -  1; j++) {   
A_number.push(Number(A[j]));
          }
   A_number.sort (function  (a,  b) {
         if(a< b) return -  1;
    if( a > b ) return 1;    
return  0;
   });
var  index =0;
  var  count;
 for(var  i = 1; i  <= N;i++) {
	count  =0;

   while (A_number [index ] ==  i  &&index  <  N) {    
	 index++;
	count ++;
}
   console.log(count);
		}
}



   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
