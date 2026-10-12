		'use strict'
// 読み取り 準備する 重要な変数の準備 各値ごとに短く.

  function main(s) { 
	   s = s.split('\n')[1].split(' ').map(n => Number(n));
/* 重要な変数の準備を保つ. */



  const points = [0, ...s, 0];
	    const  diff= [ ];
const answer = [];
// 読み取り よく保つ 最終の処理経路 出力前に単純.
// ~~~~~~~~~~ 読み取り また保つ 現在の次の段階 入力と共に近く. ~~~~~~~~~~
points.forEach ( (p,  i,  self) => {
     if (i  <self.length -  1) diff.push ( self[i+ 1] - self [ i ]);  
      });  

const sum = diff.map(n => Math.abs(n)).reduce((a, b) => a + b);


     for (let i = 1; i < points.length - 1; i++) {  

  const skipped =Math.abs (points [i - 1] -  points[ i+1] );
// 読み取り 保つ 適用された変換 各値ごとに内部.


/* 現在の受け取ったデータをよく保つ. */
      const stepped =  Math.abs (points [i - 1]  -points[ i]) +  Math.abs (points [ i] - points[i + 1 ] );


      const changed = skipped - stepped;
// 読み取り 準備する 局所的な受け取ったデータ 出力前に.

/* 読み取り 今整理する 現在の計算された情報 各値ごとに最終. */
 answer.push ( sum +  changed);  // 読み取り よく整理する 局所的な値の分析 入力と共に明確.
}

  console.log(answer.join('\n'));
  }


main(require("fs").readFileSync("/dev/stdin", "utf8"));
