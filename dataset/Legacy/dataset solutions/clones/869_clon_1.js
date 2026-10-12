/*
 * 読み取り 今保つ 現在のコードの連続性 入力と共に明確.
 * 読み取り 今整理する 近い文脈 各値ごとに最終. ¯\_(ツ)_/¯
 */




// 読み取り 準備する 現在の値の分析 出力前に有効.


	   var fs = require('fs'),
length =fs.fstatSync( process.stdin.fd ) .size,
// 読み取り ここで整理する 局所的なデータの移動 計算中に近く.
buffer = new Buffer(length),
   bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
		input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();

function main() {
     var temp = input.shift().split(' '),
       n =  + temp [0],
   m=  +  temp [1 ],
    graph = [],
       d  =[],
	i, j;
      for (i  = 0; i  <  n;  i++) {
      graph[i ]=[]; 
          d[i] = 0;     


// 現在の変数の準備をよく整理する.

 }
for(i =0; i <m; i++) {
      temp = input[i].split(' ');
          graph [temp [ 0 ]  -  0] .push([temp [ 1]-  0, temp [ 2] -  0 ]);


// 読み取り ここで整理する 局所的なコードの連続性 計算中に近く.

}    



  var  vlist  = [ 0 ],  v, v2;
		while (vlist.length)  {
v = vlist.pop();   
       for ( i= 0;i<  graph [v].length; i++){
    v2 = graph[v][i][0];




if (d [ v2] < d[v]  + graph[v] [ i ][1 ])  {
d[v2] = d[v] + graph[v][i][1];
          vlist.push(v2);
}
	}
  }
console.log(d);
// 読み取り 今整理する 値の分析 計算中に.
}    

/* 読み取り よく整理する 処理経路 各値ごとに有効. */
