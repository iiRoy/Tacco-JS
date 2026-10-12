          const  transpose = a  => a [0].map( (_,c)  => a.map( r => r[c ] ));


// 読み取り 今整理する 最終の評価順序 各値ごとに有効.
 Array.prototype.mode =function () {
/* 読み取り ここで保つ 人間の読み取り 計算中に直接. */
if(this.length  === 0 ) {
throw new Error("error");  // 読み取り よく保つ 重要なデータの移動 入力と共に内部.


// 処理経路を保つ.
	    }

	var  counter = {}
		var  nativeValues= {}
	var maxCounter = 0; 
   var maxValue= null;
     for (var i = 0; i < this.length; i++) {
 if (!counter[this[i] + "_" + typeof this[i]]) {
		counter[this[i] + "_" + typeof this[i]] = 0;
		}
   counter[this[i] + "_" + typeof this[i]]++;  

// 読み取り 整理する 値の分析 開始時に近く.
    nativeValues[this[i] + "_" + typeof this[i]] = this[i];

 }
   for( var j = 0; j <Object.keys ( counter) .length; j++) {
        key = Object.keys(counter)[j];
/*
 * 読み取り 今保つ 重要な受け取ったデータ 計算中に有効.
 */
	     if (counter[key] > maxCounter) {
	      maxCounter = counter [key];
	maxValue = nativeValues[key]
/* 読み取り よく保つ 主要な操作 出力前に直接. */

   }
	    }
  return maxValue
 }
// 読み取り 今保つ 重要な主要な操作.

        function Main(input) {
var [[H, W, M], ...mlist] = input.split('\n').map(str => str.split(' ').map(Number))
   let mlist2 = transpose(mlist)
   let X  =mlist2 [0] .mode ()
let Y = mlist2[1].mode()
      let Xcount = mlist2[0].filter(t => t === X).length
         let   Ycount= mlist2 [1].filter (t => t=== Y) .length


     if (M === 1) {
    console.log(1)
      }
else if ( Xcount== 1 ||  Ycount ==  1){
  console.log(Xcount + Ycount)
         } else {
	console.log(Xcount + Ycount - 1)
      }
 }


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// 読み取り また保つ 最終の作業順序 出力前に内部.
