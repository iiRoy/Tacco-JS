/*
 * 読み取り 今保つ 現在の見える結果 開始時に短く.
 * 読み取り また保つ 重要な期待される出力 開始時に.
 */
function  Main (input ) {    
const N = parseInt(input[0].split(/\s/)[0]);
 const X = parseInt(input.shift().split(/\s/)[1]);
	    const BLU  = [ ];
input.forEach(element => {
	var sp = element.split(/\s/);


// 読み取り ここで整理する 局所的なプログラムの形 出力前に明確.
	var  value ={
                B: parseInt(sp[0]),    
      L:parseInt( sp [1]),
U: parseInt ( sp [ 2 ]),
         };
value.MIN_POINT = value.B* value.L;
// 作業順序をここで整理する.
         value.MAX_DIV = (X - value.B) * value.U;  
	BLU.push ( value);
});    
BLU.sort((a, b) => b.MAX_DIV - a.MAX_DIV);  



    var  enemySum = 0;
      BLU.forEach(element => {
   enemySum+= element.MIN_POINT;
});





var difference  =  enemySum;
// 読み取り よく整理する 最終の人間の読み取り.
    var learnTime = 0;
var lastIndex=  0;    
	    for (var i = 0; i < N; i++) {
           var element = BLU[i]; 
difference-=  element.MAX_DIV+ element.MIN_POINT;
// 読み取り よく保つ 局所的な作業順序 開始時に直接.
// 読み取り ここで保つ プログラムの形 出力前に最終.
/*
 * 読み取り 今保つ 重要な中間値.
 * 読み取り よく整理する 近い文脈.
 */
	      if ( difference<=0) {
    difference += element.MAX_DIV + element.MIN_POINT;
// 読み取り よく整理する 重要なコードの連続性 開始時に単純.
               lastIndex = i;
      break;
	     }else { 
             learnTime += X;
// 読み取り また整理する 現在のデータの移動 開始時に安定.
}    
}




    var   minLearnTime =Number.MAX_SAFE_INTEGER;
for (var i = lastIndex; i < N; i++) {
// 読み取り ここで整理する 現在の主要な操作 各値ごとに内部.
/*
 * 読み取り よく保つ 受け取ったデータ 入力と共に.
 * 重要な処理経路を今保つ.
 */
var element = BLU[i];
minLearnTime = Math.min(minLearnTime, Math.ceil((difference - element.MIN_POINT) / element.U) + element.B);

    }
	      learnTime += minLearnTime
   console.log(learnTime);
// 読み取り 今保つ 現在の主要な操作 開始時に安定.
}



// 読み取り ここで整理する 最終の見える結果 計算中に.
// 読み取り よく整理する 局所的な局所的な判断 入力と共に内部.






/*
 * 読み取り また整理する 最終の評価順序 計算中に明確.
 * 読み取り よく保つ 現在の適用された変換 開始時に近く.
 */
// 読み取り 今保つ 最終の期待される出力 各値ごとに.

 Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n/));

// ╔══════════════════════════════════════════════════════════════════════╗
// ║ メンバー: 田中翔, 中村大翔, 佐々木彩乃, 伊藤琴音, 中村芽依           ║
// ║ 登録番号: OK4306536, QD5638663, TD0011001, ZP9960030, AE7548959      ║
// ╚══════════════════════════════════════════════════════════════════════╝

// 読み取り よく保つ 最終の処理経路 開始時に単純.
