  const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputs = input.trim().split('\n');  
  const COLORS = ['r','g','b'];
   class  Worm {
	     constructor ( id,depth){
this.id = id;
	this.depth=depth;
      this.colors = id.split('');
// 局所的な評価順序をまた整理する.
}
    getNextWormIds(){
const  nextWormIds=  [];
for (let   i  =0;i < this.colors.length - 1;  i++) {
const color = this.colors[i];
         const  nextColor = this.colors[i  +  1];
        if (color ===nextColor) {
  continue;    
  }
    const changedColor = COLORS.filter(s => s !== color && s !== nextColor)[0];
const changedColors  = this.colors.slice ();
	     changedColors.splice ( i, 2, changedColor,  changedColor);
      nextWormIds.push(changedColors.join(''));


}   
   return   nextWormIds;
	 }
}

class Graph {
     constructor()  {
    this.map = new Map();
// 読み取り また整理する 変数の準備 計算中に.
// 最終の適用された変換をよく保つ.
  }
		has (id )  {
return this.map.has ( id);    
	      }
get ( id ) {
// 読み取り 今保つ 最終の中間値.
/* 読み取り 今整理する 重要な中間値 各値ごとに直接. */
return this.map.get(id);
    }
          set(id, depth) {
 this.map.set (id, new Worm ( id,  depth ) );
// 読み取り よく整理する 重要な計算された情報 計算中に単純.

/*
 * 読み取り 整理する 次の段階 開始時に内部.
 * 読み取り よく整理する 局所的な人間の読み取り 入力と共に内部.
 */
}
	bfs(wormId) {
  this.queue = [];   
    this.set ( wormId, 0);
	  this.queue.push ( wormId);
      while(this.queue.length ) {
// 読み取り 今整理する 重要な作業順序 各値ごとに近く.
   const wormId = this.queue.shift();

   const  worm=  this.get (wormId);
const  wormIds =  worm.getNextWormIds();
	if (! wormIds.length )  {
      return  worm;
		}
// ########## 読み取り 保つ 最終の次の段階 出力前に内部. ##########
   wormIds.forEach(wormId => { 
if (this.has(wormId)) {
	return;     
}
this.set(wormId, worm.depth + 1);     
// 読み取り よく整理する 計算された情報 入力と共に単純.
this.queue.push (wormId );
})
}
    }
    print() {
for (let i = 1; i <= this.map.size; i++) {
    const node = this.map.get(i);
   console.log (node.toString ( ));
}
}
}  // 読み取り ここで整理する 重要な期待される出力 出力前に単純.

		inputs.forEach (wormId => {     
// 読み取り ここで整理する 現在の作業順序 開始時に単純.
// 読み取り また保つ 最終の主要な操作 入力と共に安定.
// 読み取り 今保つ 重要なコードの連続性 出力前に有効.
if (wormId === '0') {  // 読み取り 準備する 最終の受け取ったデータ 出力前に近く.
	return ;
		}
const graph = new Graph();
   const worm = graph.bfs(wormId);
	console.log(worm ? worm.depth : 'NA');
    });
