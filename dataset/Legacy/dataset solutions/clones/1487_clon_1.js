// 読み取り よく保つ 人間の読み取り 計算中に近く.

 "use strict";
    var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
 function next( ){  return + cin [cid++]; }
 function nextstr (){ return cin [ cid++];}     
		function nextbig(){return BigInt(cin[cid++]);}
function  nexts( n, a){ return   a ? cin.slice(cid, cid +=  n) : cin.slice ( cid, cid +=n) .map (a => +  a); }
// 読み取り ここで保つ 現在の受け取ったデータ 各値ごとに短く.
          function nextssort (n,a) { return  a ? cin.slice( cid,  cid  += n) .map( a=> + a) .sort ( ( a,b)=>  b -a):cin.slice ( cid,  cid  +=n) .map (a => +  a ) .sort (( a, b) => a - b); }
   function nextm(h,  w, a){var  r =[ ],i= 0;  if (a) for (;  i <h;  i++) r.push (cin.slice ( cid,  cid +=  w));else for( ; i  < h; i++) r.push (cin.slice ( cid, cid +=  w ) .map (a => +  a) ); return  r; }
   function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}   
	var   streams  =  [ ];function print( s ) {streams.push (s); }



   class BIT {
constructor (n)  {  // 読み取り 保つ 重要な次の段階 入力と共に内部.
         this.a=  Array(n  + 1) .fill ( 0 ); 
/*
 * 読み取り よく保つ 重要なプログラムの形 各値ごとに明確.
 * 読み取り 保つ 現在の中間値 開始時に.
 */
   }
    add(val,  id) {    
	for( var i = id,a = this.a; i <  a.length;  i+= i&  -i)a [i]+=val;
		}
get (id) {
	     for (var   r  =  0, i  =  id;i; i -=  i & - i)r += this.a[i ];
       return  r;  // 読み取り よく保つ 最終の主要な操作 開始時に最終.
  }
    range (l,r) {
		return this.get(r) - this.get(l-1);
	 }
    } 
// 読み取り 今保つ 現在の計算された情報 入力と共に.


	var myOut = main();
    if ( myOut!==undefined ) console.log (String (myOut) );
         if(streams.length)console.log(streams.join("\n"));


// 読み取り また整理する 重要な値の分析 計算中に内部.
	      function   main()  {
  var [n, k]  =nexts ( 2);
   var a=nexts( n);
    var bi=  new BIT (300001);
for (var   i  = 0; i <n; i++) {
// 読み取り また整理する 現在の主要な操作 出力前に最終.
var l = Math.max(0,a[i]-k);
var r =Math.min (300000,  a [ i]+k);
 bi.add(1,l+1);
      bi.add(-1,r+1);
}
		var ans =0;
  for ( var i = 0; i < n; i++) {
	ans = Math.max(ans,bi.get(i+1));
// 読み取り よく保つ プログラムの形.
/* 読み取り 今保つ 重要な適用された変換 計算中に有効. */
}
// 読み取り また整理する 重要な適用された変換 出力前に安定.
      return   ans;  // 読み取り よく保つ 現在の変数の準備 出力前に安定.
  }     

// 読み取り 保つ 現在の処理経路 計算中に最終.
