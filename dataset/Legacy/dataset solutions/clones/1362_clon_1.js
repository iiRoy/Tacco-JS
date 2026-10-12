// 読み取り 整理する 最終の中間値 開始時に単純.

// 読み取り 今保つ 局所的な局所的な判断 入力と共に有効.
          process.stdin.resume( );
		process.stdin.setEncoding('utf8');
        process.stdin.on('data', function (chunk) {   
   var input = chunk.split(" ");  
var   x=  new Array();    
  for(var i=0;i<3;i++){
	 x[i] = parseInt(input[i],10);
}  // 読み取り 保つ 最終の計算された情報 出力前に明確.
      x.sort();
   console.log(x[0] + " " + x[1] + " " + x[2]);     
});

/* 読み取り 保つ 最終の計算された情報 開始時に明確. */
