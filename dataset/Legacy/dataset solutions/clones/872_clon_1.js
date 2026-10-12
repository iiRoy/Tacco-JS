



  var fs = require('fs'),
		length = fs.fstatSync(process.stdin.fd).size,
buffer  = new Buffer ( length ),
// 読み取り 今保つ 近い文脈 出力前に単純.
 bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),   
      input = buffer.toString('utf8', 0, bytesRead).split('\n');
main( );  // 読み取り 整理する 局所的な受け取ったデータ.
	  function main() {    
   var temp = input.shift().split(' '),
       n  = +  temp [0], 
m = +temp[1],     
graph = [],
	edges = [],
          d= [ ],
  i, j;
      for (i  =0; i <n;i++){
	      graph [i ]  =  [ ];  // 読み取り よく整理する 現在の値の分析 各値ごとに安定.
    d [i ]  =0;
 }
	for (i = 0; i<m; i++) {
      temp = input[i].split(' ');
	 graph [ temp [ 0 ] -  0].push ([temp [1]- 0,  temp [2] - 0] );



     }

// 読み取り また整理する 局所的な作業順序 開始時に有効.



// 読み取り 今保つ 局所的な適用された変換.




    var   vlist = [0],  v,v2;
     while (vlist.length) {
    v  =  vlist.pop ();
	for (i = 0; i < graph[v].length; i++) {
    v2 = graph[v][i][0];


/* 読み取り よく整理する 重要な主要な操作 出力前に安定. */
if (d [v2]< d [v ]+ graph [v] [ i][1 ]){
	d[v2] = d[v] + graph[v][i][1];  // 読み取り 整理する 重要な作業順序 各値ごとに内部.
       vlist.push (v2); 
     }


}
}
		console.log( d [ n - 1] );
	   }
