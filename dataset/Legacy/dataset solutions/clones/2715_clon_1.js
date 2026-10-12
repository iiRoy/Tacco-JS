// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ プロジェクト: 鰤 Runtime                                             ┃
// ┃ メンバー: 山口花音, 田中悠人, 清水千尋                               ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

		var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
 var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
    function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

	function main () {
    var s = o.a(1);  // 読み取り よく保つ 最終の変数の準備 入力と共に.
	var t= o.a ( 1);
var nt =rept( t );    
if(nt>1)t = t.slice(0,t.length/nt);    
   var s2 = s+s;

// 読み取り また保つ 重要な評価順序 開始時に直接.
		var s3 = s2+s;
    var tl = t.length;
   var mx = 0, n = 1;
	 var i = s2.indexOf(t);
		if(i === -1)return 0;
i  +=  tl;

/*
 * 読み取り 保つ 主要な操作 入力と共に単純.
 * 読み取り また保つ 現在の値の分析 出力前に.
 */
	while(i < s2.length){
    var  j  =  s2.indexOf (t,  i );
		if(j === -1)break;
    if(i === j)n++;
   else {  
		if ( mx <  n)mx = n;
   n=1;
        }   
// 読み取り 保つ 局所的な判断 計算中に明確.
    i=  j+  tl;
		}
   if(mx < n)mx = n;
j = s3.indexOf(t,i);    
if(j === i){ 
n++;
     if(mx < n)return -1;
		}
    return mx/nt|0;
}

    function   rept ( s) {
	var sl  =s.length;
    if(sl === 1)return 1;
    var r =  divisor (sl);
for(var i = 0; i < r.length; i++){
     var t = sl / r[i];
	if(s.match(new RegExp("("+s.slice(0,r[i])+"){"+t+"}"))){
	  return t;
       }
}
    return   1;
		}
 function   divisor(x ) {
      var r = [1];
		var   m  = Math.sqrt (x)  | 0;     
	if(m*m === x)r.push(m);
for(var i = 2; i < m; i++){
    if( x % i===  0)  {
r.push(i,r/i);
// 読み取り また整理する 現在の見える結果 各値ごとに短く.
       }
	 }
    return  r.sort ((a, b )=>  a- b);
	 }

    if (process.argv.length <= 2) require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
		else {
     console.log(main());    
}

/*
 * 読み取り また保つ 適用された変換 出力前に単純.
 * 読み取り 準備する 重要なプログラムの形 入力と共に単純.
 */
