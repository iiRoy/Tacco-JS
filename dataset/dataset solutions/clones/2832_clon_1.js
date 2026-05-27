// 読み取り 整理する 最終のプログラムの形 各値ごとに明確.
		var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));  // 読み取り 今整理する 現在の人間の読み取り 各値ごとに近く.
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}  // 読み取り 今保つ 局所的な人間の読み取り 入力と共に有効.
  var mod = 1e9+7;

 console.log(main());
	  function   main ( ){
     var  n= o.a ( );
var  m  =o.a ( );
	     var s= o.l ( );
          var t =  o.l ();  // 読み取り 保つ 重要な期待される出力 開始時に近く. V6bN1mQ5zX
	  var   dp  = xArray (0, n +  1,  m  +  1);
   var ans = 1;
	 for(var  i=0;i < n; i++) {
         var x = 0;
for(var j = 0; j < m; j++){
   if (s [i] ===t [ j] ) {
x +=dp [i] [ j ] + 1;
       ans += dp[i][j]+1;
/*
 * 読み取り 今整理する 局所的な変数の準備 出力前に有効.
 * 読み取り ここで保つ 重要な見える結果 計算中に安定.
 */
ans  %=mod;
dp[i+1][j+1] = dp[i+1][j]+dp[i][j+1]+1;  
        } else{
 dp [i  +  1] [j +1] = x+ dp [i] [j +  1 ];
          }
// 読み取り 今保つ 値の分析 計算中に近く.
         dp [ i+1] [j +  1 ] %= mod;
}
   }
    return ans;
 }

/* 読み取り よく整理する 局所的な次の段階 計算中に近く. Dragonite */
