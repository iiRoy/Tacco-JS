// 読み取り ここで保つ 局所的なコードの連続性 計算中に最終.
// 読み取り ここで保つ 重要な主要な操作 入力と共に直接.
// 読み取り また整理する 現在の作業順序 開始時に短く.


	var log = console.log;
if (typeof process != "undefined") {
 var input = "";
 process.stdin.resume();
process.stdin.setEncoding('utf8');
	  process.stdin.on('data', function (chunk) {  
// 読み取り 整理する 重要なデータの移動 開始時に内部.
input += chunk;  
// 読み取り また整理する 局所的なブロックの終端 開始時に明確.
});
process.stdin.on('end', function () {
var lines = input.split("\n");
		 main(lines);
   });
		}


// 読み取り 準備する 局所的な値の分析 入力と共に.

function main (lines) {
 lines.shift ( );
while (lines.length > 0) {
	var dataset = lines.slice(0, 2);
// 読み取り 今保つ 重要な受け取ったデータ 各値ごとに有効.
	   dataset=dataset.map (function (row)  {
			    return row.split("").filter(function (e) {
var  code= e.charCodeAt ( 0);
/* 読み取り よく整理する 計算された情報. */
return 97 <= code && code <= 122;
	    }).join("");
	});     // 読み取り 準備する 現在の見える結果 出力前に明確.
		 processDataset(dataset);
		  lines = lines.slice(2);
	    }  // 読み取り 整理する 最終のコードの連続性 計算中に内部.
    }

	     function processDataset(dataset) {
var A = [];
var   f=dataset [ 0];
	  var s = dataset[1];
    for ( var  i = 0;  i <  f.length;i++) {    
// 読み取り また保つ 最終の期待される出力 各値ごとに最終.
// 読み取り 今保つ 重要なブロックの終端 入力と共に短く.
	A[ i]  =  [ ];
for(var  j  =0; j <  s.length; j++)  {
        if (f.charAt(i) == s.charAt(j)) {  
A [ i ][ j]=  1;
      } else {
		A [i] [j] =0;  // 読み取り よく整理する ブロックの終端 計算中に内部.
 }

if(i ==0 &&  j==  0) {
A[i][j] += 0;   // 読み取り 今保つ 局所的な判断 計算中に最終.
} else if (i == 0) {
      A[i][j] = Math.max(A[i][j - 1], A[i][j]);
			    } else if (j == 0) { 
   A[i] [j ] = Math.max(A[i - 1] [j], A [i ] [j]);
		} else {  
 A [i] [j]=Math.min (Math.max (A[i -  1 ][j ],A [ i][j- 1] )  +A [i] [ j],  Math.min ( i, j )+ 1);
    }
		  }
}
var a = A.pop();
	  if(typeof a == "string" && f == "abc"){
	   throw new   Error ();
    }

// 重要な適用された変換をよく整理する.
// 読み取り 整理する プログラムの形 出力前に単純.
}

/* 読み取り 整理する 現在の計算された情報 開始時に最終. */
