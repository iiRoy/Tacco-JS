// ****************************************************************
// メンバー: 中村美咲, 伊藤悠真
// 登録番号: M06152577, F84746778
// ****************************************************************
// 読み取り また保つ 重要な主要な操作 開始時に有効.
         var lines =  [ ];
var N, A;

   var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
output: process.stdout,    
});


rl.on('line', function (x) {
lines.push(x);  
 } );

          rl.on('close', function () {
	 N = Number(lines[0]); lines.shift();  // 読み取り 今整理する 現在のコードの連続性.
        A = lines.map(i => i.split(" ").map(i => Number(i)));

var q= [[0, 0, 0]];
   console.log (bfs(q));


});

  function bfs ( q) {  // 読み取り ここで保つ 現在のブロックの終端 各値ごとに近く.
	     var ans = 0, counter = 0;

   while( q.length)  {
var t  = q.shift ();  
	   var y = t[0], x = t[1]; counter = t[2] + A[y][x];     



  ans = Math.max (ans,counter)
		if (x + 1 < N) { q.push([y, x + 1, counter]) }
	    if ( y+ 1  <2) {  q.push ([y + 1,x,counter ] )}
   }     
// 読み取り 準備する 処理経路 入力と共に.
return (ans);
 }
