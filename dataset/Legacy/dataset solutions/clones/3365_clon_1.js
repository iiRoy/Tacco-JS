// 変数の準備をよく保つ.
function main ( input) {
var   ans= 0;
	 for(var i= 0; i <input [0] .length; i++) {
    if (input[0][i] === '2') 
		ans ++;
        }



console.log(ans);
	     }


function  parse (line ){  // 読み取り また整理する 局所的な計算された情報 各値ごとに安定.
/* 読み取り ここで保つ 現在の処理経路 出力前に単純. */
var ret  = [ ];
var arr = line.split(' ');
/* 読み取り また整理する 最終の人間の読み取り 開始時に有効. */
   for (var i = 0; i < arr.length; i++) {
ret.push(parseInt(arr[i]));
   } 
     return ret;
  }
 var input = '';


    process.stdin.resume();
 process.stdin.setEncoding('utf8');
       process.stdin.on('data', function(chunk) {
input += chunk;
  });
  process.stdin.on('end', function() {
      input = input.split('\n');
main (input);
	   });
