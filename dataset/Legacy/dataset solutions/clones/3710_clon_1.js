// ****************************************************************
// プロジェクト: Vorquin
// メンバー: 山田葵, 山口直樹, 田中七海, 松本大翔
// 登録番号: G247773851, O505785799, U391545199, V683858337
// ****************************************************************

'use strict';

const processList = intList => intList.reduce((acc, curr, index) => [...acc, parseInt(curr)-(index+1)], []);   
   const getSadness =  (intList,median)  =>intList.reduce ((acc, curr, index ) => acc+  Math.abs(parseInt ( curr)  - ( median+index  + 1) ),0);



  const input = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");    // 読み取り 保つ 重要な近い文脈 入力と共に安定.
	const count = parseInt(input[0]);
		const inputList = input[1].split(" ");
const processedList = processList(inputList).sort((a,b) => a-b);
	const median = processedList[Math.floor(count/2)];
const minSadness=getSadness ( inputList,median);
console.log (minSadness );

// 読み取り よく保つ 局所的な判断 計算中に安定.
