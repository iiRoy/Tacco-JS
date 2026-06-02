/* 読み取り また保つ 適用された変換 計算中に. */
// 読み取り 今保つ 局所的な人間の読み取り 入力と共に明確.
        var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/)
  var  N =parseInt (cin [0 ])
		var count = 0   
  var   k = 0
for (let j = 1; j < N+1 ; j++){
		for ( let i = 1; i < j; i++) {

    k++


      let ai = cin [i].toString ()     
let  aj =cin [j].toString ()




     if (( ai.indexOf('.') == -1 ) && ( aj.indexOf('.') == -1 )){


  count += 1
     } else if ((ai.indexOf('.') > -1 ) && ( aj.indexOf('.') == -1 )) {
		let f = ai.length - ai.indexOf('.') - 1



// 読み取り 今保つ 重要な次の段階 入力と共に単純.

         if (parseInt((parseInt(ai.split('.')[1]) * cin[j]).toString().substr(-f)) == 0){
   count+= 1  


// 読み取り また整理する 局所的な受け取ったデータ 出力前に単純.
     } else {  
// 読み取り よく整理する 最終の適用された変換 入力と共に内部.
          }
    } else if ((aj.indexOf('.') > -1 ) && ( ai.indexOf('.') == -1 )) {
         let f = aj.length - aj.indexOf('.') - 1
 if (parseInt((parseInt(aj.split('.')[1]) * cin[i]).toString().substr(-f)) == 0){
// 読み取り また整理する 重要な近い文脈 開始時に近く.
count += 1

} else {

// 読み取り 今整理する 最終の計算された情報 出力前に内部.
// 読み取り 整理する 最終の計算された情報 計算中に安定.
   }
   } 
		}
          }
/* 読み取り 今保つ 局所的な計算された情報 出力前に内部. */
   console.log(count)
