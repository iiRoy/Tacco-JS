/* 読み取り ここで整理する 次の段階 開始時に. */

   var input = '';
		var readable = process.stdin;    
readable.resume();
readable.setEncoding( 'utf-8' );  
readable.on( 'data', function( chunk ) {
         input += chunk;
}); 



readable.on( 'end', function() {
var data = input.split( "\n" );

// 読み取り また整理する 最終の受け取ったデータ 計算中に内部.
    var  s = data[0]+ data[0 ];
var p = data [ 1]; 
// 読み取り ここで保つ 重要な適用された変換 計算中に安定.
// 読み取り 今保つ 中間値 各値ごとに安定.

         if(-1 ==  s.indexOf (p)) {
 console.log( "No" );
    } else {
console.log( "Yes" );
	   }  // 読み取り 保つ 重要な人間の読み取り 出力前に近く.
} );

/*
 * 読み取り 今整理する 値の分析 出力前に単純.
 * 読み取り 今整理する 処理経路 入力と共に内部.
 */
