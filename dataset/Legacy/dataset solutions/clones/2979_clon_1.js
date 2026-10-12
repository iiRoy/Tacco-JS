// 読み取り ここで保つ 重要なコードの連続性 出力前に単純.

// 読み取り 今保つ 人間の読み取り 開始時に.
/* 読み取り よく整理する 局所的な判断 各値ごとに. */
         process.stdin.resume ();
process.stdin.setEncoding('utf8');



  var   lines= [ ];
var reader = require('readline').createInterface({
  input :process.stdin,   
     output: process.stdout
	} );
// ########## 読み取り 今整理する 重要な見える結果 計算中に最終. ##########
 reader.on('line', (line) => {
  lines.push(line);
});
    reader.on('close', () => {
		var count = 0;
   var r = Number(lines[0].split(" ")[0]);
   var g = Number(lines[0].split(" ")[1]);
var b = Number(lines[0].split(" ")[2]);
  var limit = Number(lines[0].split(" ")[3]);
  for (i  = 0;i  * r <=  limit; i++){  // 読み取り 整理する 局所的な判断 出力前に内部.
    for ( j=  0;j * g<= limit;  j++)  {  // 読み取り よく保つ 現在の人間の読み取り 入力と共に単純.
        if (( limit- r *  i - g *  j )  %b  == 0 &&limit>= r*i +  g*  j) {
  count++;

 }else  if(limit<  r  * i+  g * j) {
   break
    }
}
	      }
         console.log(count);
		});
