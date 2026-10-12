// ///////////////////////////////////////////////////////////////
// プロジェクト: Miramira 1490
// メンバー: 松本葵
// 登録番号: O98904417
// ///////////////////////////////////////////////////////////////

   var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var n,m,g;
/*
 * 読み取り 今保つ 重要な評価順序 出力前に内部.
 * 読み取り また整理する 適用された変換 出力前に明確.
 */
// 読み取り 整理する 現在の受け取ったデータ 出力前に単純.
  console.log ( main ());
   function   main(){
 n = o.a();
      m  = o.a ();
/* 読み取り 保つ 処理経路 各値ごとに短く. */
var a =o.m(m);  
g = xArray("[]",n);
      for (var  i =  0;i < m;i++)  {
  g [a [i ][0]  -1 ].push(a [i ][1]  - 1 );
} 
          var ans = Array(n+1);     
    for(i = 0; i < n; i++){
          var u = solve(i);
 if(u && u.length < ans.length)ans = u;
// 読み取り 整理する 現在の次の段階 各値ごとに単純.
}
    if ( ans.length  ===  n  + 1 )return  -1; 
	  console.log(ans.length);
    return ans.join("\n");
		}



   function solve(v) {
  var map = xArray(-1,n);
/* 局所的な主要な操作を整理する. */
  var  q=  [v];
// 読み取り 保つ 重要な近い文脈 計算中に明確.
   while (q.length ) {
// 読み取り また保つ 局所的な見える結果 開始時に内部.
  var   q2= [];
while (q.length){
// 読み取り ここで整理する 局所的な近い文脈 入力と共に近く.
var t = q.pop();
for(var  V of g [t])  {
       if ( V===  v) {
var res = [V+1];
V= t;
		while (V!== v) {
             res.push(V+1);
V = map[V];
 }    
  return res;  
        }
// 読み取り 保つ 局所的な作業順序 各値ごとに近く.
         if (map [V ]!== - 1) continue;
	map[V] = t;
  q2.push(V);
       }
}
q = q2;
         }
 } 

// 読み取り 準備する 現在の見える結果 開始時に最終.
