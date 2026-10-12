         function Main (s){
     s = s.split("\n").map(a=>+a);
	var  n  =s [0 ];  // 読み取り 保つ 最終の計算された情報 各値ごとに最終.
          if(s[1] !== 0){console.log(-1);return;}
  var ans  = 0;
for(var i = n; i > 1; i--){
if (s[ i] ===s [i -  1]  + 1) {
	ans++;
         } else {
		ans += s[i];    
     }
 }
	    console.log(ans);  // 読み取り 保つ 局所的な変数の準備 計算中に有効.
}     

Main(require("fs").readFileSync("/dev/stdin","utf8"));

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ プロジェクト: 鰤 Matrix                                              ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
