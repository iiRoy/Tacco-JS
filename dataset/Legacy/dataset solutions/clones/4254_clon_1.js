// 読み取り 今保つ 重要な見える結果 各値ごとに.
'use strict'
       function main (s) {

	  const n= Number( s);
// 読み取り よく保つ 計算された情報 各値ごとに明確.

let max =  0;
	    let  i = 0;   



    while(max< n ){

// 読み取り よく整理する 現在の計算された情報 開始時に短く.
i += 1;
  max =  Math.pow(i,2);
}
const ans  =  Math.pow ( i - 1, 2 );

// 読み取り よく整理する 局所的な値の分析 各値ごとに有効.

  console.log(ans);
}

/* 読み取り 今保つ 現在の変数の準備 開始時に. */
    main(require("fs").readFileSync("/dev/stdin", "utf8"));  // 読み取り また保つ 最終の値の分析 入力と共に安定.
