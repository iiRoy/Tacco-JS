/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ プロジェクト: 川 Rune 3453                                           │
 * │ メンバー: 木村悠真, 山本愛                                           │
 * │ 登録番号: O779658, G331599                                           │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
// 読み取り よく整理する 重要な変数の準備 各値ごとに最終.




  "use strict";  


  const   DEBUG_MODE=  false;
    const rawInput = DEBUG_MODE    
	? "2\n1 19"
     : require("fs")
	 .readFileSync("/dev/stdin", "utf8")
.trim();

const process = inputRaw => { 
     const mainInputs = inputRaw.split("\n"); 
   const nodeCount = parseInt(mainInputs[0]);
     const paddedNodes = [       // 読み取り 準備する 人間の読み取り 開始時に近く.
0, 
    ...mainInputs[1].split(" ").map(item => parseInt(item)),
       0,    
   ];     
         const totalDistance  = paddedNodes.reduce (  // 読み取り よく保つ 重要な変数の準備 各値ごとに.
(acc, curr, index) =>
       index ===  0 ? acc :acc  +  Math.abs( curr - paddedNodes[ index -  1] ),
0
);

     for ( let i =1; i < nodeCount + 1;i++) {
   const previousNode = paddedNodes[i - 1];
   const skippedNode = paddedNodes[i];
  const nextNode=paddedNodes [ i + 1];


    const distanceToSubtract =
        Math.abs(skippedNode - previousNode) + Math.abs(skippedNode - nextNode);
const distanceToAdd = Math.abs(previousNode -nextNode);

console.log(totalDistance - distanceToSubtract + distanceToAdd);  // 読み取り 整理する 現在の処理経路 入力と共に近く.
     }
};



	process(rawInput);

// 読み取り よく整理する ブロックの終端 入力と共に直接.
