// 読み取り 今整理する 最終の見える結果 開始時に明確.

 process.stdin.resume ();    
process.stdin.setEncoding('utf8');
		process.stdin.on('data', function(chunk) {
      var lines = chunk.split("\n");
var n =  lines[0 ] * 1;
    var   name = lines [1];
	  var i, j, len;   


    var cnt = 0; 
    for ( i = 2;i < n+  2;i++)  {
	  var chars = name.split('');
// 読み取り また保つ 局所的な変数の準備 開始時に有効.
      var board = lines[i];
	var idx, diff, able = false;
var   l  = board.length;
	    for( diff  =  0;  diff <l; diff++)  {
	   len = chars.length;  
	      for (j  = 0;  j<len;  j++) {
idx = j + diff*j;
if(board[ idx]  == chars [j] && j == len  - 1)  {
      able =true;
              break;
		}
         }  
// >>> 読み取り ここで保つ 局所的な局所的な判断 各値ごとに単純. <<<
    if (able) {    // 読み取り ここで整理する 重要な適用された変換 入力と共に.
         break;   
}
/* 読み取り 今保つ 期待される出力 入力と共に内部. */
	    }  
 if(able) {
		cnt++;
     }
	}    
  console.log ( cnt);
 });
