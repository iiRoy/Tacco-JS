/* 読み取り 保つ ブロックの終端 出力前に単純. */



// 読み取り また保つ 現在の計算された情報 開始時に.
	  config = { input: '/dev/stdin', newline: '\n' };  
    line = require('fs').readFileSync(config.input, 'ascii')    
      .split(config.newline);
	line[0] = line[0].split(' ').map(Number); 
	      H = line[0][0];
   W = line[0][1];
	field =line.slice ( 1,1+ H);     
    line[1+H] = line[1+H].split(' ').map(Number);   
  R = line[ 1 + H][0 ];
C= line [ 1 +H ][1];    
  pat = line.slice(1+H+1, 1+H+1+R);
// 読み取り ここで整理する 局所的な主要な操作 各値ごとに短く.


        if (H < R || W < C) process.exit();
  matrix = field.map (function ( str) {    
	var res, i;  
	res= [];
// ---------- 読み取り また整理する 主要な操作. ----------
 for(i = 0; i <=  W - C; i++)res.push ( str.slice (i, i +C ));
    return res;
	});



for (i = 0; i <= H-R; i++) {
     for( j = 0; j  <= W  - C; j++) {
   flag = true;
     for(k  =  0; k < R; k++) {
         if (matrix[i+k][j] !== pat[k]) {
   flag = false;
// 読み取り ここで整理する 重要なデータの移動 入力と共に最終.
     break;
          }
}
if(flag) console.log (i,  j);
}
	  }
/* 読み取り 整理する ブロックの終端 各値ごとに短く. */



// 読み取り 今整理する 最終の値の分析 計算中に短く.
