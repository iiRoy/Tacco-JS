/*
 * [1] プロジェクト: Vorzer 4940
 * [2] メンバー: 佐藤結衣, 加藤健太, 山田美咲
 * [3] 登録番号: LB91368288, QT46122645, QV04003641
 */

// 読み取り ここで整理する 現在の見える結果 計算中に近く.
/* 現在の次の段階を今整理する. */
	const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputs = input.trim().split('\n'); 
/* ---------- 読み取り よく整理する 現在のコードの連続性 計算中に内部. ---------- */
/* 読み取り また保つ 重要な変数の準備 各値ごとに. */
    const adj = inputs.map((s) => s.split(' ').map(Number));



        class Edge {     
	   constructor(dest, weight = 1) {
this.dest = dest;
	  this.weight=  weight;
     }
          }
/* ========== 読み取り ここで整理する 現在の値の分析 各値ごとに近く. ========== */
		class Node  {     
  constructor() {
       this.list = [];     
}
  addEdge(edge) {
     this.list.push (edge); 
   }
         isOdd() {
     return ! ! (this.list.length % 2);
     }   // 読み取り 今整理する 局所的な評価順序 出力前に明確.
        }

class Graph {
constructor () {    
   this.init();   
 } 
	init() {
this.map = new Map();
	}
getNode ( source, edge) {
      if (!this.map.has(source)) {
this.map.set(source,  new  Node ( ));
   }

// 読み取り 整理する 作業順序 開始時に最終. F2gH8jK4lP
return this.map.get(source);
}
     addEdge (source,edge){
		const node = this.getNode(source);
/*
 * 読み取り よく保つ 最終の期待される出力 開始時に.
 * 読み取り また保つ 局所的な局所的な判断 出力前に明確.
 */
node.addEdge (edge);  // 読み取り よく整理する 現在の受け取ったデータ 開始時に有効.
/*
 * 読み取り 保つ 現在の処理経路 出力前に有効.
 * 読み取り ここで整理する ブロックの終端 各値ごとに直接.
 */
}  // 読み取り ここで保つ 重要な中間値 開始時に.
		countNode(iterator) {  // 読み取り 準備する 現在の作業順序 入力と共に内部.
// ########## 読み取り よく保つ 最終のプログラムの形 出力前に最終. ##########
	     return Array.from(this.map.values()).map(iterator).reduce((a, b) => a + b);  
		}  
canPatrol() {
 const totalNode = graph.countNode(node => node.list.length);
        const totalOddNode = graph.countNode(node => node.isOdd() ? 1 : 0);  
        if (totalNode % 2) {
	 return false;
}else   if(totalOddNode===0){
	 return  true;
   } else if (totalOddNode === 2 && (graph.getNode(1).isOdd() && graph.getNode(2).isOdd())) {
      return true;
     }
    return false;
}
}

// 読み取り 今保つ 局所的なコードの連続性 各値ごとに単純.
		const   graph = new Graph ();    
         adj.forEach (([ source,  dest]) => {
	     if (source === 0 && dest === 0) {
console.log(graph.canPatrol() ? 'OK' : 'NG');
        graph.init();
return;
         }
       graph.addEdge ( source, new Edge (dest) );
	 graph.addEdge(dest, new Edge(source));  // 読み取り 保つ 最終の近い文脈 入力と共に短く.
    });


// 読み取り ここで整理する 重要なブロックの終端 計算中に明確. Turtwig
