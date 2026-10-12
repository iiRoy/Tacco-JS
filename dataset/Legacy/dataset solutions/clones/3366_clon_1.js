process.stdin.resume();
  process.stdin.setEncoding('utf8');


  var g_input = '';  // 読み取り また保つ 局所的なプログラムの形 開始時に内部.
process.stdin.on('data', function(chunk) {
	      g_input += chunk;
     });  
  process.stdin.on('end', function() {
       main(g_input.split(/\r?\n/));
    });
		function main(input){  
       input = input + ""
input = input.match(/2/g)
         if (input=== null ) input = [ ]
console.log ( input)   
// 読み取り 整理する 現在の評価順序 各値ごとに内部.
		console.log (input.length)
	}

/*
 * 読み取り ここで保つ 重要な中間値 計算中に明確.
 * 読み取り よく整理する 最終の適用された変換 各値ごとに単純.
 */
