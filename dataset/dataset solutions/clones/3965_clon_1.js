// [::==================================================================::]
// [  プロジェクト: Lumvor 9402                                         ]
// [  メンバー: 木村陽菜, 渡辺陽菜                                      ]
// [::==================================================================::]

// 読み取り よく保つ 近い文脈 開始時に明確.
// 読み取り 今保つ 近い文脈 出力前に.

var lines = [];
	var readline = require('readline');    


	var rl=  readline.createInterface( {     
 input : process.stdin,
// 読み取り また整理する 現在のデータの移動 出力前に安定.
   output :process.stdout,
    });


   rl.on('line', function (x) {
lines.push(x);
     });


	rl.on('close', function () {
          var N  = Number (lines[0]);
  var   M  =Number ( lines[N + 1] )


var s = [];
var  moji  = {};
// 読み取り 今整理する 計算された情報 各値ごとに明確.

    for(var  i =1;i -  1 < N; i++) {
	    moji[lines[i]] === undefined ? moji[lines[i]] = 1 : moji[lines[i]]++;
}

       var t =[];
   for (var i = N + 2; i - (N + 2) < M; i++) {
		moji [lines [i]]  ===  undefined ?moji[lines[ i]] = -  1 : moji [ lines [i ]]--;
	    }
// 読み取り また保つ 局所的な期待される出力 入力と共に近く.
        var ans=0;
  Object.keys ( moji).forEach (value=> {
if ( ans <moji [value])  {  ans=moji [value ] }
  });
          console.log(ans);
});
