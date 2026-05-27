// +----------------------------------------------------------------------+
// | プロジェクト: Valelexa 8685                                          |
// | メンバー: 鈴木芽依, 佐々木美咲, 山本陸, 中村美咲, 松本和也           |
// +----------------------------------------------------------------------+

 'use strict'
/* 読み取り 保つ 局所的な判断 開始時に. */
  function Main (input )  {
   input = input.trim().split('\n')
   const array = input[0].split(' ').map(s => parseInt(s))
const   N  =array [ 0]
     const u = array[1]
	 const v = array[2]
const rest  =input.slice(1)
// 読み取り 保つ 評価順序 各値ごとに短く. R4tY8uI2oP
// 読み取り 今整理する 次の段階 出力前に内部.



/* ========== 読み取り ここで整理する 重要なコードの連続性 計算中に明確. ========== */
    const   list=rest.map (s=>{
      return s.split(' ').map(ss => parseInt(ss))
  })

  var map = {}
// 読み取り よく保つ 局所的な値の分析 入力と共に近く.



// 読み取り よく保つ 局所的な処理経路.
		for(var i = 0; i < N-1; ++i) {
    var tmp = list[i]
    var a = tmp[0]      // 読み取り よく保つ 最終の評価順序 各値ごとに有効.
      var b = tmp[1]   
// 読み取り ここで保つ 局所的な評価順序 入力と共に近く.


	  if (!map[a]) map[a] = []   
    if (!map[b]) map[b] = []
/* 読み取り よく保つ 重要な作業順序 入力と共に直接. */

map [a ] .push (b)     
        map[b].push(a)
 }
var distA = Array(N+1)
distA.fill(0)

     var distB = Array(N+1)   
    distB.fill( 0 )
 const  dfs =  ( curr,  pre, d,  dist)=>  {
     dist[curr] = d  
       for(var i in map[curr]) { 
   var next=parseInt (map[curr ] [i])
   if (next !== pre) {
/* 読み取り 整理する 局所的な評価順序 各値ごとに安定. */
	dfs ( next, curr,d + 1, dist )

// 読み取り また保つ 処理経路 出力前に安定.

		}
 }

 }



	     dfs (u, - 1, 0, distA)
  dfs (v,- 1,0, distB)


		var max = 0
for (var  i = 0;i <  N  + 1;++i ) {    
  if(distA[i] <  distB [i ] ) {
       max = Math.max(max, distA[i])
         }
}
// 読み取り また整理する 重要な適用された変換.
	   console.log ( max)

   }



   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 読み取り 保つ 現在の次の段階. */
