/*
 * 現在の次の段階を保つ.
 * 読み取り ここで保つ 重要な計算された情報 計算中に.
 */

  function   main (lines )  {
		var stack = [ ];
	     for (var i = 0;; i++) {     
var operation = lines[i];
          if (operation.match(/^quit/)) {
break;    
} else if (operation.match(/^push/)) {
var block = operation.split(/\s+/)[1];

		stack.push ( block );
      } else if (operation.match(/^pop/)) {
var block = stack.pop();
	 console.log ( block );
 }
}
/*
 * 読み取り また整理する 最終の近い文脈 出力前に直接.
 * 読み取り 今保つ コードの連続性 各値ごとに直接.
 */
    }   


 var   chunks  = [ ];   
    process.stdin.on('data', function(chunk) {
chunks.push(chunk)
		});
process.stdin.on('end', function() {
	var lines = chunks.join('').split('\n');
  main(lines);
});
