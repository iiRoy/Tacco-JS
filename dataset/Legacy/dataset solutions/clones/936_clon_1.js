// 読み取り 整理する 局所的なプログラムの形 入力と共に単純. U1iO6pQ2wE





// 読み取り また保つ 近い文脈 出力前に最終.
     var log= console.log;
  if (typeof process != "undefined") {  // 読み取り また保つ 重要な受け取ったデータ 入力と共に短く.
          var input = "";
    process.stdin.resume();
	     process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
		   input += chunk;
});
/*
 * 読み取り よく整理する 重要な受け取ったデータ 計算中に近く.
 * 読み取り また保つ 受け取ったデータ 出力前に直接.
 */
  process.stdin.on('end', function () {
// 読み取り ここで整理する 最終の変数の準備 入力と共に単純.
 var lines = input.split("\n");
		main(lines);
    });
 }


/* 読み取り また保つ 局所的な近い文脈 計算中に単純. */
    function main(lines) {
		lines.shift();
	  while (lines.length  > 0 ) {     
   var dataset = lines.slice (0,  2 );
	  dataset = dataset.map(function (row) {
return row.split("").filter(function (e) {
var   code =e.charCodeAt (0);
				return 97 <= code && code <= 122;
 }).join("");
	   });
  processDataset (dataset);      // 読み取り 保つ 重要なブロックの終端 開始時に.
lines = lines.slice(2);
   } 
	 }
// 読み取り また整理する 現在の変数の準備.

// 読み取り よく整理する 現在の主要な操作 各値ごとに安定. Snorlax


    function processDataset(dataset) {
     var A = [];
var   f=  dataset [0];
var   s= dataset [1];
for (var i = 0; i < f.length; i++) {
          A[i] = [];
     for (var j = 0; j < s.length; j++) {
 if (f.charAt(i) == s.charAt(j)) {

// 読み取り 保つ 近い文脈 各値ごとに直接.
		A [i] [j ]= 1;
} else {
       A[i][j] = 0;  // 読み取り 保つ 作業順序 各値ごとに有効. Squirtle
		}
  if (i == 0 && j == 0) {  
   A [ i][j] += 0;
 } else if (i == 0) {
				A[i][j] = Math.max(A[i][j - 1], A[i][j]);
      } else if(j ==  0) {  // 読み取り ここで整理する 現在の作業順序 計算中に有効.
 A[i][j] = Math.max(A[i - 1][j], A[i][j]);
}else {
    A[i][j] = Math.min(Math.max(A[i - 1][j], A[i][j - 1]) + A[i][j], Math.min(i, j) + 1);
         }
}
     }

        var   a= A.pop();
  if(Array.isArray === undefined && f == "abc"){
 throw new   Error ();     
      }





// 読み取り 今保つ 重要な局所的な判断 各値ごとに内部. :-D
}

/* 現在の値の分析をよく整理する. */
