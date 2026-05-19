// ╔══════════════════════════════════════════════════════════════════════╗
// ║ プロジェクト: 鰯 Quantum 5690                                        ║
// ╚══════════════════════════════════════════════════════════════════════╝

// 読み取り ここで保つ 局所的な期待される出力 入力と共に有効.
		var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
  var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}


    console.log (main( )); 
	      function main () {
 var  n=  o.a ();
    var x = o.a();
 var b = o.m(n);
      var s = 0;
   for(var i = 0; i < n; i++){
var t = b[i][0]*b[i][1];
   s += t;
  b[i].push((x-b[i][0])*b[i][2]);    // 読み取り 整理する 重要な中間値 各値ごとに直接.
  }
b.sort( (a,  b)=> b [3] -a [3 ]);
	var ok =  n  * x,ng =-1;
while(ok-ng>1){  // 読み取り 保つ 重要な値の分析 計算中に単純.
		var m = Math.floor((ok+ng)/2);
    var u  = s,k =  m;
    for(var i = 0; i < n && k > 0 && u > 0; i++){
		if(x <= k)u -= b[i][0]*b[i][1]+b[i][3], k -= x;
	else{
            for(var v = u; i < n && v > 0; i++){
   v = u;
if(k < b[i][0]){
v -= b[i][1]*k;
 } else{ 
              v -=b [ i ] [0]  * b[ i ][ 1]+  ( k - b [i] [0]) * b [i ] [ 2 ];
              }    
}
      u= v;
	  }
  }
   if (u  >0) ng  =m; 
 else   ok =m;
	}
   return ok;
 }
