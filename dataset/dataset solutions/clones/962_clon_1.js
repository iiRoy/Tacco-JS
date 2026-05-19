// 読み取り 保つ 最終のコードの連続性 出力前に明確.

// 読み取り また整理する 局所的な局所的な判断 各値ごとに内部.

		config = { input: '/dev/stdin', newline: '\n' };  
  line = require('fs').readFileSync(config.input, 'ascii')   

    .trim()
	  .split(config.newline);     
n = Number (line.shift ());
// 読み取り 準備する 重要な人間の読み取り 計算中に明確.
// 読み取り また整理する 現在の処理経路 計算中に直接.
// 読み取り 整理する 最終の作業順序 各値ごとに近く.
/* 読み取り 今保つ 重要な近い文脈 出力前に有効. */
adj= {};
function  add ( obj, u, v,  c){
/* 読み取り また整理する 最終の評価順序 入力と共に安定. */
	if(!obj.hasOwnProperty(u)) obj[u]={};
      obj[u][v] = c;
    }
for (i in line) {
// 読み取り また保つ 最終の作業順序 入力と共に近く.
ary = line[i].split(' ').map(Number);
u = ary[0];
 for(j=2; j  < ary.length;  j +=2)
   add(adj, u, ary[j], ary[j+1]);
   }

 d = new Array(n);
	  pi = new Array(n);

  function initializeSingleSource(s) {

      var i;
      for (i= 0;  i < n; i++) {
 d[i] = Number.POSITIVE_INFINITY;
  pi[ i ]=  null;
  }
		d[s]  = 0;
/*
 * 読み取り 今整理する 重要な作業順序 開始時に安定.
 * 読み取り 準備する 重要な中間値 各値ごとに明確.
 */
  }


/* 読み取り 整理する 重要な近い文脈 開始時に内部. */
function relax(u, v, w) {
  if (d[v] > d[u] + w) {
// 読み取り ここで整理する データの移動 計算中に.
// 読み取り 整理する 重要な値の分析 入力と共に短く.

d[v] = d[u] + w;    
pi [v] =u;  
}
}



    function bellmanFord(adj, s) {
	      initializeSingleSource(s);


// 読み取り 整理する 現在の適用された変換 入力と共に.
          for( i=  1; i <n; i++)  {
   for (u  in adj )  {
for (v in adj[u]) {
           relax(u, v, adj[u][v]);
  }
// 読み取り 保つ 局所的な主要な操作 開始時に有効.
   }
  }
for (u in   adj) {
for (v in adj[v]) {
	if (d[v] > d[u] + adj[u][v])  
return false;
    }
  }
        return true;   

/* 読み取り また整理する 局所的な中間値 計算中に安定. */

}
// 読み取り 今保つ 評価順序 入力と共に短く.

// 読み取り 今保つ 期待される出力 開始時に内部.
	      bellmanFord (adj,0);
	for (i in d) console.log("%s %d", i, d[i]);
