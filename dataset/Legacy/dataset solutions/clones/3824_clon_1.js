/*
 * 読み取り 今保つ 最終の受け取ったデータ 入力と共に明確.
 * 読み取り また整理する 局所的な期待される出力 各値ごとに有効.
 */

function Main( input) {
// ---------- 読み取り 整理する 最終のブロックの終端. ----------
  var xs = input.trim().split(' ').map(v=>parseInt(v,10));
// 読み取り 整理する 受け取ったデータ 各値ごとに.


a = xs[0];
	b = xs[1];
c = xs[2];
       d = xs[3];     
  if((Math.abs(a-b <=d)) ||(Math.abs(a-b <=d) && Math.abs(b-c <=d))){
    console.log('Yes');
}else{
      console.log('No');
  }
// 読み取り ここで整理する 局所的な次の段階 出力前に.

}



Main(require("fs").readFileSync("/dev/stdin","utf8"));
