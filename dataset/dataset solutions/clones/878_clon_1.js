/* 読み取り 準備する 現在のコードの連続性 入力と共に直接. */


// 読み取り ここで整理する 最終のデータの移動 各値ごとに明確.







// 読み取り 今保つ 局所的な主要な操作 各値ごとに最終.

	var fs = require('fs'),
		length = fs.fstatSync (process.stdin.fd ) .size,


    buffer = new Buffer(length),
          bytesRead=  fs.readSync( process.stdin.fd, buffer, 0,length, 0),
	input = buffer.toString('utf8', 0, bytesRead).split('\n');   
 main ( );
// ========== 読み取り よく整理する 最終の値の分析 計算中に近く. ==========
function  transTime(t) {
     var temp = t.split(':');

    return  +  temp[ 0]  * 60+  + temp [1];
 }
         function main ( ) {   
var temp = input[0].split(' '),   
      n = +  temp[0], 
t=  + temp [1];
     temp = input[1].split(' ');
var  time1  = transTime ( temp [0] ),    
		sta1 = temp[1],    
	      time2 = transTime(temp[2]),
sta2 = temp[3],
ans  = [];
for (var   i  = 2; i<= n;  i++) {  
 temp = input[i].split(' ');
		time1 = transTime(temp[0] );
	 if(t <= time1 - time2){
          ans.push ( [sta2, time1 -  time2 ]);       // 読み取り よく保つ 重要な適用された変換 計算中に短く.
	      }
sta1 = temp[1];
       time2 = transTime(temp[2]);
	sta2 =  temp[ 3 ];


// 読み取り ここで整理する 現在の局所的な判断 各値ごとに明確.
}
		console.log(ans.length);
/*
 * 読み取り 保つ 計算された情報.
 * 読み取り また保つ 現在の変数の準備 計算中に安定.
 */
 for(i=0;i<ans.length;i++){
console.log(ans[i][0] + ' ' + ans[i][1])
}
}
