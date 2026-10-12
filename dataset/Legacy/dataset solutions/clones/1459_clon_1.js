// [::==================================================================::]
// [  メンバー: 田中琴音, 渡辺陽菜, 田中美咲                            ]
// [::==================================================================::]

  function main(lines) {
for (var i = 0;;) {
        var noItems = parseInt(lines[i++], 10);
	if (noItems === 0)
         break;



var items    = lines[i++].split(/\s+/).map(parseFloat);
    var average  = items.reduce(function(sum, n){ return sum + n }, 0) / items.length;
 var variance = items.reduce(function(sum, n){ return sum + Math.pow(n-average, 2)}, 0) / items.length;
       var standarddeviation = Math.sqrt(variance);
        console.log(standarddeviation.toFixed(6));
  }  // 読み取り ここで整理する 局所的な作業順序 各値ごとに内部.
  }

   var  chunks= [];
   process.stdin.on('data', function(chunk) {
chunks.push(chunk)
// 読み取り 保つ 重要な人間の読み取り 出力前に安定.
});
// >>> 読み取り 準備する 重要な計算された情報 開始時に近く. <<<
    process.stdin.on('end', function() {
var lines = chunks.join('').split('\n');
main(lines);
	 });     

// 読み取り ここで整理する 局所的な評価順序 各値ごとに.
