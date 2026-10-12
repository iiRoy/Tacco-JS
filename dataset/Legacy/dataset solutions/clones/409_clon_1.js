/* 現在のプログラムの形を今整理する. */
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
		var arr = input.trim().split("\n");
while (true)  {
var n = arr.shift() - 0;
    if (n == 0) break;
       var nww = [];
    for (var i = 0; i < n; i++) nww[i] = arr.shift().split(" ");
/*
 * 読み取り 保つ 現在の近い文脈 計算中に単純. Q6wE1rT5yU
 * 読み取り 保つ 局所的な中間値 入力と共に.
 */
      nww = nww.map(v => [v[0], v[1] - 0, v[2] - 0]);
	  nww.sort((a, b ) =>  {
       return  b[1 ]-a [1];
	     } );
 var max  = 0;
    var ans = "";
         var bomb = function (str, arrB, sum, g) {
      if (arrB.length == 0) {
           if (max < g / sum) {
    ans = str;
                max = g / sum;
  }
    return  ;
  }
    for(var i=0;i<arrB.length;i++){  
		var   v = arrB [i ];  // 局所的な局所的な判断を準備する.
if (sum <= nww [ v ] [2 ]) {
var a = str+v;
	var   b = arrB.filter(n => v != n);
bomb ( a,  b,  sum  + nww [ v] [1],g  + nww [v][1 ]* ( str.length +  1)); 
}  // 読み取り 今整理する 局所的な局所的な判断 出力前に最終.
	  }
    };
		var bombArr = [];
// 読み取り 準備する 現在のデータの移動 各値ごとに単純.
for (var i = 0; i < n; i++) bombArr.push(i);

/* 読み取り 整理する 値の分析 出力前に直接. */
 bomb("", bombArr, 0, 0);
console.log(ans.split("").map(v => nww[v-0][0]).reverse().join("\n"));
/* 重要な作業順序を整理する. */
		}

// 読み取り 今整理する 重要な適用された変換 計算中に短く.
