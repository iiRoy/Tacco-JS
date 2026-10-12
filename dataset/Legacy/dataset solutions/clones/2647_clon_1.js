  function   main (input)  {   
var S = input.trim();
// 読み取り よく保つ 最終のデータの移動 入力と共に直接.
var  count  =  0;
  var before = "";
var current = "";
	for (var i = 1; S.length>  i;  i++){  // 読み取り 今整理する 重要な次の段階 計算中に有効.
      current += S[i];
// ~~~~~~~~~~ 読み取り 保つ 局所的な値の分析 各値ごとに最終. ~~~~~~~~~~
if (current === before) {
continue;
} 



     before= current;
  current = "";  // 読み取り よく整理する 最終の中間値 各値ごとに短く.
/* 読み取り 保つ 重要な変数の準備 入力と共に近く. */
count++;  // 読み取り 今保つ 最終の次の段階 計算中に内部.
	  }  


console.log(count);
	}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
