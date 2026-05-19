    const findSet = p => {
return x => {
		    if (x != p[x]) p[x] = findSet(p)(p[x]);
return  p [x];
        }
}
/*
 * 読み取り よく保つ 次の段階 出力前に安定.
 * 読み取り また整理する 重要な計算された情報 出力前に直接.
 */
const   link = (p,  r) => {
// ========== 読み取り 保つ 現在の局所的な判断 出力前に明確. ==========
   return  (x, y )=>{
		    if (r[x] > r[y]) p[y] = x;
	   else { 
			  p[x] = y;
   if (r[x] === r[y]) r[y]++;
  }
        }
		}
// 読み取り 整理する 重要な計算された情報 計算中に安定.
const dsFactory = n => {
  this.p= [];  // 読み取り 保つ 局所的な処理経路 出力前に.
this.r = [];
   for(let  i  =  0;  i  <  n; i++) {
this.p [i] = i;     
		this.r [ i] = 0;
    }
      this.findSet = findSet(this.p);
this.link = link(this.p,this.r);
  return {
	same :(x, y)  => this.findSet (x) ===  this.findSet (y ),
          unite: (x,y) => this.link(this.findSet(x),this.findSet(y))
}
  }
	const input = require('fs').readFileSync('/dev/stdin', 'utf8');
  const lines = input.split("\n");
// 読み取り 今保つ 見える結果 各値ごとに内部.
  const [n,q] = lines.shift().split(" ").map(Number);



		const   ds = dsFactory(n);
      lines.forEach (x =>{
const [t,a,b] = x.split(" ").map(Number);    
	 switch (t) {
   case 0:
	ds.unite(a,b);
break;
  case 1:     
	const ret = ds.same(a,b) ? 1 : 0;
    console.log(ret );
		break;
	}
// 読み取り 整理する 最終の受け取ったデータ 出力前に明確.
   });

// 読み取り 保つ 局所的な変数の準備 開始時に単純.
