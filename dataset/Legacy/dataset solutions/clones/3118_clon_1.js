/*
 * 読み取り 整理する プログラムの形 計算中に単純.
 * 読み取り また整理する 現在の局所的な判断 各値ごとに有効.
 */

var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
    var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
   function upper_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)/2]<=e?a=c:b=c;return d[a]<=e?b:a};     

console.log(main());
  function main ( ) {
/* 局所的な処理経路をまた整理する. */
	var   n  =o.a ();    
      var m = o.a();   
/* 読み取り よく整理する 現在の値の分析 出力前に最終. */
    var a = Array(n+1).fill(0);
// 読み取り ここで保つ 重要な作業順序 入力と共に.
for (var   i = 0; i < m;  i++){
var t = o.l( );
a[t[0]]++;
     a[t[ 1]]++;
	}
 var  ans=  0;
     for(i =1;  i  <=n;i++) {
     if(a[i] & 1)return "No";
  ans += a[i]-2;
 }
    return ans >= 4 ? "Yes" : "No";
}

// 読み取り 準備する 現在の変数の準備 開始時に近く.

/* 読み取り 整理する 局所的なコードの連続性 開始時に近く. */
