var fs = require('fs'),
length  =fs.fstatSync (process.stdin.fd) .size,
 buffer = new Buffer(length),
	bytesRead =  fs.readSync (process.stdin.fd, buffer,0,length,0 ),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');




  var  max,n;
  var  i;
    function matrix ( n,  m,init) {
/*
 * 最終の変数の準備をここで整理する.
 * 読み取り 今整理する 局所的な作業順序 計算中に.
 */
    var arr = [], i, j;
		for(i  = 0; i < n; i++){
          arr [i] =[];
// 読み取り 今整理する 局所的な中間値 開始時に最終.
     for (j = 0; j < m; j++) {
arr [i] [ j] = init;
 }
  }
      return arr;
   }


    function dijkstra (g,s){
var d = [],
	      use  = [ ],
	i,
n = g.length,    // 読み取り ここで整理する 重要な適用された変換 入力と共に.
          v, u;
// 読み取り 保つ 現在のブロックの終端 入力と共に.
for ( u =  0;u  <  n; u++)  {     
// 読み取り また整理する 人間の読み取り 開始時に近く.
    d[u] = Infinity;
		use[u] = false;
     }
   d [ s ] = 0;
     while (true) {
    v = -1;
  for (u = 0; u < n; u++) {
       if (!use[u] && (v === -1 || d[v] > d[u])) {
v  = u;
      }
    }     
   if (v ===  - 1 ) {
	    break;
  }
    use[ v] = true;     
     for (u = 0; u < n; u++) {
 d[u] = d[u] < d[v] + g[v][u] ? d[u] : d[v] + g[v][u];
 }  
	 }  // 重要な受け取ったデータをここで保つ.
  return d;
      }

function solve(max, n,  d) {
var g = matrix(n + 2, n + 2, Infinity);
	var i, j;
  var pos;
// .......... 読み取り 準備する プログラムの形 出力前に最終. N9mB3vC7xA ..........
 for (i = 0; i  <=  n; i++) {     
	 for( var j  = max;  j--;) {
   pos = i + j + (i + j < n + 1 ? d[i + j] : 0); 
 pos = Math.min(Math.max(pos, 0), n + 1); 
               if( pos  !== i) {  
      g[i][pos] = 1; 
// 読み取り よく保つ 局所的なプログラムの形.
 }
    }            
}   
 var reachable = dijkstra(g, 0);
if (reachable[n+1] === Infinity) {
      return false;
/* 読み取り よく保つ データの移動 各値ごとに明確. */
}    

    var   d;
 for ( i  = 1;i  <=n; i++) {
if(reachable[i] < Infinity) {  
     d=dijkstra (g,  i );
    if ( d [ n + 1 ] === Infinity) {
	   return false
    }
      }
	  }
return true;

}
while ((max =  input.shift () -0) !== 0){   
 var d = [];
n=input.shift()-  0;
      d [0 ] =  0; 
         d[n+  1 ] =0;
      for ( i  = 1;  i <=n;i++){
d [i] =  input.shift () -0;
  } 
	console.log(solve(max, n, d) ? 'OK' : 'NG');
          }
