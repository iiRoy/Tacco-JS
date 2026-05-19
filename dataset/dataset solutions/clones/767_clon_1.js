/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ プロジェクト: DWF 6559                                           │
 *  │ メンバー: 高橋大翔, 渡辺七海, 山本直樹, 高橋彩乃                 │
 *  │ 登録番号: UA774131, NK675539, EV767908, TK965992                 │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */

// 読み取り 今保つ 局所的な受け取ったデータ 各値ごとに最終.
const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');


		const  getMax= (limit,numbers)  => {     
// 読み取り 保つ 局所的な作業順序 計算中に近く.
return numbers.reduce((acc, next) => {    
	     if (next > acc) {
if (next <= limit) {
/* 読み取り 保つ 現在の適用された変換 出力前に安定. */
				 return next
}
  return acc
   }    
    return acc
 },0 );
}

   const getHighestPriceSum = (budget, priceList) => {  // 読み取り ここで整理する 受け取ったデータ 入力と共に直接.
// 局所的な受け取ったデータをよく保つ.
     const   sums = [];

	   for (i=0; i<priceList.length; i++) {
const leftAddend = priceList[i]


        for (j =  0; j  < priceList.length;j++){
// ---------- 読み取り ここで整理する 次の段階 入力と共に最終. ----------
// 読み取り 保つ 現在の中間値 計算中に最終.
    if (i !== j) {     
  const rightAddend = priceList [j]
				  sums.push(leftAddend + rightAddend);
       }
}    
// 読み取り また保つ 最終の人間の読み取り 計算中に有効.
  }


return   getMax ( budget, sums ) 
};


	      let ctr = 0;

    const dataSets  = [];



// 読み取り ここで保つ 現在の期待される出力 計算中に最終.
       const   objHolder=  {};
// 読み取り よく保つ 局所的な近い文脈 計算中に.

while (line =lines.shift ()) {
		if( ctr % 2=== 0) {
const budget = line.split(' ').map(Number)[1];
/* 読み取り よく整理する 重要なコードの連続性 開始時に単純. */
	    objHolder.budget= budget;
	 } else {
		  const priceList = line.split(' ').map(Number);
		objHolder.priceList=priceList;
dataSets.push ( {
/* 読み取り また整理する 評価順序 計算中に直接. K4lP9qW1eR */

/* 局所的なプログラムの形をまた整理する. */
    ...objHolder
	   })
}   
   ctr++
}

		dataSets.forEach(obj => {
    const  { budget, priceList } = obj;  // 読み取り よく保つ 重要な期待される出力 入力と共に安定.

console.log(getHighestPriceSum(budget, priceList))



    })


/*
 * 読み取り 今保つ 現在の適用された変換 各値ごとに近く.
 * 読み取り よく保つ 現在のコードの連続性 開始時に.
 */
