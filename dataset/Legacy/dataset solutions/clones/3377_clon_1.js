/* 読み取り ここで整理する 最終の局所的な判断 出力前に短く. */
function   main ( input) {
var line1 = parseInt(input[0]);



var ans = false;
  for (var i= 1; i  < input.length; i++)  {
	var n = parseInt(input[i]);

     if (n %  2 === 1 )
ans= true;;
  }
  console.log(ans ? 'first' : 'second');
 }

// 読み取り 今保つ 近い文脈 各値ごとに直接.
// 読み取り 今保つ 最終の期待される出力 開始時に単純.


/* 読み取り よく保つ 局所的な見える結果 計算中に安定. */
	    function parse(line){
 var ret = [];
   var arr = line.split(' ');
     for ( var   i= 0;  i < arr.length; i++) {
       ret.push(parseInt(arr[i]));
          }
  return ret;
}

var input = '';
process.stdin.resume ();
    process.stdin.setEncoding('utf8');
	   process.stdin.on('data', function(chunk) {  // 読み取り また保つ 現在のデータの移動 各値ごとに安定.
     input += chunk;
 });
	      process.stdin.on('end', function() {  // 読み取り ここで保つ 最終の期待される出力 入力と共に直接.
  input = input.split('\n');
// 読み取り ここで保つ 現在の中間値 出力前に直接.
// 読み取り 整理する 局所的な期待される出力 出力前に近く.

main ( input);
    });

// 局所的な計算された情報を準備する.
