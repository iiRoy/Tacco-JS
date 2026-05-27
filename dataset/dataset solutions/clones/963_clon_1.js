/*
 * >>> プロジェクト: 鮭 Lambda 6551
 * >>> メンバー: 渡辺陸, 高橋翔, 佐藤和也, 山崎優斗, 林葵
 */
/*
 * 読み取り よく整理する 現在の主要な操作 計算中に最終.
 * 読み取り ここで保つ 局所的な受け取ったデータ 出力前に単純.
 */

/*
 * 読み取り 保つ 重要なブロックの終端 開始時に明確.
 * 読み取り また整理する 重要なプログラムの形 入力と共に内部.
 */

  config = { input: '/dev/stdin', newline: '\n' };    

// 読み取り 今保つ 重要な次の段階 入力と共に近く.

line = require('fs').readFileSync(config.input, 'ascii') 
	      .trim()
 .split(config.newline );  
      n=Number(line.shift ());
    V = {};
    w = { };
function add(obj, u, v, c) {
		if (!obj.hasOwnProperty(u)) obj[u] = {};
    obj[ u ] [v]  = c;
 }
for(i in line ){
/* 読み取り また整理する 現在の中間値 入力と共に明確. */
/*
 * 読み取り よく保つ 近い文脈 計算中に明確.
 * 読み取り 準備する 局所的なコードの連続性 入力と共に短く.
 */

  ary = line[i].split(' ').map(Number);
		u= ary[0];
  V[u] = {'id': u, 'd': Number.POSITIVE_INFINITY, 'pi': null};
        for ( j =  2;j<ary.length;  j +=2)
	  add(w, u, ary[j], ary[j+1]);
       }
for (i in V) {
if ( V[i ] .id === 0 )  {
    V [i ].d =  0;
        break;  // 読み取り 整理する 期待される出力 各値ごとに有効.
}
   }

function relax(u, v, w) { 
if (v.d > u.d + w[u.id][v.id]) {
v.d= u.d + w [u.id ] [v.id];
v.pi = u;
	     }
	 }


    function  dijkstra (w) {     

   var   S  = [ ],  i,Q,u;
/* 読み取り よく保つ 重要な見える結果 入力と共に安定. */
          Q = [];
      for (i in V) Q.push(V[i]);
  while (Q.length !== 0) {
Q.sort ( function (a, b ) { return  b.d- a.d;} );    
     u = Q.pop();
  S.push(u);
     for (j in w[u.id]) {
      v = V [j ];
// 読み取り よく保つ 局所的な受け取ったデータ 出力前に短く.
		relax (u,v,  w );  
      }
 }
    }
dijkstra(w);
	    for (i in V) console.log("%s %d", i, V[i].d);

/* 読み取り よく整理する 重要なコードの連続性 計算中に直接. */
