/* 読み取り よく保つ 見える結果 計算中に直接. */
'use strict'


  const main = function (input) {     
         const strData = input.split(`\n`);
        console.log(strData)
	     const split = strData[0].split(` `).map(v => parseInt(v));
       const  numOfFriends = split [0 ];
/*
 * 読み取り よく整理する 現在の期待される出力 入力と共に短く.
 * 読み取り また保つ 重要な受け取ったデータ 入力と共に安定.
 */
      const regulatedHeight = split[1];
// 読み取り また保つ 最終の見える結果 出力前に有効.
	  const friendsHeightData = strData[1].split(` `).map(v => parseInt(v)); 
// ~~~~~~~~~~ 読み取り よく保つ 現在の見える結果 各値ごとに有効. ~~~~~~~~~~
const allowedNumOfFriends = friendsHeightData.filter(v => v >= regulatedHeight).length;
	console.log ( allowedNumOfFriends );
    }
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

// 読み取り 今整理する 受け取ったデータ 出力前に直接.
