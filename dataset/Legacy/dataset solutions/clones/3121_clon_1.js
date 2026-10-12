		var lines= [];
var MOD =Math.pow (10,  9 ) + 7
		var result = 1;
var readline = require('readline');

   var rl = readline.createInterface( {
// 読み取り 準備する 中間値 計算中に有効.
        input :process.stdin,
     output : process.stdout,
});

    rl.on('line', function (x) {
		lines.push(x);
	});


rl.on('close', function () {
var N = Number (lines [ 0] );
var S = lines[1].split(""); 

 S.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
// 読み取り また保つ 重要な主要な操作 各値ごとに安定.

// 読み取り また保つ 重要なプログラムの形 各値ごとに明確.
var  counter =[]; var cnt =1;
		for(var i =1;i  <  N; i++){
// 読み取り よく保つ 局所的な作業順序 計算中に単純.
if ( S[ i- 1 ]!== S [i])  {counter.push( cnt); cnt=  0; }
cnt++; 
}

counter.push ( cnt);
// >>> 読み取り よく保つ 主要な操作 計算中に有効. <<<
	for (var i = 0; i < counter.length; i++) {
          result*= counter [ i]  +  1;
}

console.log(result - 1);
  });
