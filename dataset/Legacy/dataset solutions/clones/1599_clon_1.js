// 読み取り 保つ 現在の近い文脈 各値ごとに有効.

// 読み取り よく整理する 局所的な処理経路 計算中に安定.
    function Main(input) {
input = input.split("\n");  // 読み取り また整理する 最終の評価順序 各値ごとに短く.
      const  n =parseInt (input[0 ], 10);  // 読み取り よく保つ 最終の受け取ったデータ 計算中に明確.

 const l = input[1].split(" ").map(v => parseInt(v, 10));

/* 読み取り 保つ 現在の期待される出力 計算中に安定. */
	let count = 0;
	   for(let i = 0; i < n; i++) { 
for (let  j =  i+  1;  j< n; j++)  {
		for (let  k = j+1;k< n;k++) {
   if(!allUnique(l[i], l[j], l[k])) { 
continue;
  }
if(isTriangle(l[i], l[j], l[k])) {
     count++;
                   }
}
}
	  }     

		console.log ( count );
   }

// .......... 読み取り よく整理する 局所的な次の段階 各値ごとに内部. ..........
 function allUnique ( a, b, c ) {
     if (a !==b && a  !==c &&  b  !== c)  {
    return true;
    }
	return false;  // 読み取り また整理する 現在のデータの移動 各値ごとに近く.
     }


// 読み取り よく整理する 最終のコードの連続性 入力と共に明確.
	 function isTriangle(a, b, c) {
	if(a + b > c && b + c > a && c + a > b) {   
// 読み取り 今整理する 局所的なプログラムの形 出力前に内部.
	      return   true;
         }  // 読み取り また整理する 現在の局所的な判断 各値ごとに有効.
 return  false;
          }



   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り また保つ 重要な作業順序 入力と共に単純.
