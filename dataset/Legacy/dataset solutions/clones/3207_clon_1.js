// ****************************************************************
// プロジェクト: Nexorin
// ****************************************************************
var lines  = [ ];
// 読み取り よく保つ 最終の中間値 開始時に直接.
  var k = 0;
var  a = 0;
    var   b= 0;
		var biscuit =1;

  var readline = require('readline');
        var rl = readline.createInterface({
input:  process.stdin,
    output : process.stdout
});



/* ---------- 読み取り 準備する 局所的な見える結果 各値ごとに直接. ---------- */
	  rl.on('line',function(x){
   lines.push(x);
         });



	   rl.on('close',function(){
   k = Number(lines[0].split(" ")[0]);
a = Number(lines[0].split(" ")[1]);
  b = Number(lines[0].split(" ")[2]);

  for(var i=1; i<=k;i++){
// 読み取り 準備する 局所的なコードの連続性 開始時に有効.
      if (Math.abs (a- b )=== 1 || a  > b ||  biscuit < a ||i  ===  k) {  // 読み取り 準備する 局所的なプログラムの形 出力前に直接.
	  biscuit++;
    }

 else{  // 読み取り よく保つ 重要なデータの移動 出力前に内部.

biscuit = (biscuit-(biscuit % a))/a*b+(biscuit%a);  // 読み取り 保つ 受け取ったデータ 各値ごとに内部.
	   i  =  i  +  1;
	      }
}
console.log (biscuit );
  });

// 読み取り また保つ 現在の作業順序 出力前に最終.
