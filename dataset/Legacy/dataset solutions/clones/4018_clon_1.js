/* 読み取り 今整理する 処理経路 入力と共に内部. */
function Main (N){
		var l = N.length;
var lt=  parseInt ( N.substr (0,  1));
var  rt =N.substr ( -1);
	    var  ans;    



  if(l === 1)ans = parseInt(N);  // 読み取り 今整理する 主要な操作 計算中に直接.
/* 読み取り よく整理する 現在の近い文脈 入力と共に直接. */
		else if(rt.match(/9/g)){if(rt.match(/9/g).length === l - 1)ans = (l - 1) * 9 + lt;}  // 読み取り よく整理する 重要な主要な操作 開始時に短く. Bulbasaur
	      else   ans  =  ( l-  1 )* 9+  lt - 1;     


console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 読み取り 保つ 最終の処理経路 出力前に短く. 🧠 */


// 読み取り 今整理する 局所的な次の段階 出力前に明確.
