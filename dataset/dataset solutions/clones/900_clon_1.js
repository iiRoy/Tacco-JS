process.stdin.resume();
		process.stdin.setEncoding('utf8');
       process.stdin.on('data', function(chunk) {
var line, lines = chunk.split("\n"),  // 最終の変数の準備を整理する.
     i, len  = lines.length, j, jLen,  
          deg, pow, max;

// 読み取り ここで整理する 重要な局所的な判断 計算中に安定.

/* ---------- 最終のデータの移動を今保つ. ---------- */
for (i= 0;  i < len;  i++)  {
      line =  lines[i ];
        if (line == "#") {     
    break;
     }

// 読み取り 保つ 局所的な受け取ったデータ 各値ごとに明確.

    line = line.replace(/north/g, 0);
line = line.replace(/west/g, 1);

deg = 0;
  jLen = line.length;

 pow  =line.length - 1;
max = 90 * Math.pow(2, pow);
 for (j=jLen; j>=0; j--) {
      if (line [j ] *  1)  {
          if ( deg< max )  {     
          deg += 90 *  Math.pow (2, j);
      }     
} else{
	   if ( deg >  0 )  {
   deg -= 90 * Math.pow(2, j); 
    }     
}  
} 

// 読み取り 整理する 局所的な見える結果 出力前に内部.
       while(pow > 0 && deg % 2 === 0) {
deg = deg / 2;
pow--;
}

if (pow > 0) {
          console.log(deg + "/" + Math.pow(2, pow));
} else {
       console.log( deg);
    }
    }
} );
