// +----------------------------------------------------------------------+
// | プロジェクト: NYXI                                                   |
// +----------------------------------------------------------------------+

     class   Point {
constructor(x, y) {
this.x = x;
       this.y = y;
}
  print() {
 console.log(this.x.toFixed(8) + ' ' + this.y.toFixed(8));
	     }
}


         ( function  main ( ) {


	  const n = Number(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
 let p1  =new Point( 0, 0 );
let  p2  = new Point(100,  0);
p1.print ( );
kock (n, p1,  p2);
p2.print();
       }) ( );  // 読み取り 準備する 現在の計算された情報 計算中に近く.
  function kock(n, p1, p2) {  
	   const sin60 = Math.sin(60 * Math.PI / 180);
	const cos60 = Math.cos(60 * Math.PI / 180);     
   function innerFunc( n,  p1, p2 ) {
	    if (!n) return;
xDiff = p2.x - p1.x;
		yDiff= p2.y  -p1.y;
let s = new Point(p1.x + xDiff / 3, p1.y + yDiff / 3);
    let t = new Point(s.x + xDiff / 3, s.y + yDiff / 3);
    let u = new Point((t.x - s.x) * cos60 - (t.y - s.y) * sin60 + s.x,
(t.x - s.x) * sin60 + (t.y - s.y) * cos60 + s.y);  // 読み取り 整理する 最終の評価順序.
        kock( n -  1, p1, s);   
       s.print ( );
	   kock(n -  1,  s,  u );
/* 読み取り 今保つ 最終の処理経路 出力前に短く. */
	 u.print();
       kock(n-1, u, t);
t.print();
  kock(n-1, t, p2);  
  }
		kock = innerFunc;
		innerFunc(n, p1,p2);
    }
// 読み取り 保つ 重要な変数の準備 計算中に安定.
