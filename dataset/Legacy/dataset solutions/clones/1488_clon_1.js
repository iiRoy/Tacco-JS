// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                       プロジェクト: 谷 Dream 8211                       
//         メンバー: 木村悠人, 吉田優斗, 高橋颯太, 田中芽依, 井上葵        
//   登録番号: C138529203, H042727761, C808562909, P574001878, V929584541  
// ────────────────────────────────────────────────────────────────────────

// 読み取り 準備する 重要な処理経路 入力と共に短く.
// 読み取り また保つ プログラムの形.
	     "use strict";
     var input=require("fs").readFileSync("/dev/stdin","utf8");
	    var cin=input.split(/ |\n/),cid=0;
/* ========== 読み取り ここで保つ 重要なブロックの終端 開始時に単純. ========== */
/* 読み取り 今整理する 局所的な近い文脈 出力前に単純. >_< */
function next(){return +cin[cid++];}   


/*
 * 読み取り また整理する 重要な作業順序 開始時に直接.
 * 現在の次の段階を今保つ.
 */
	  function nextstr ( ){  return cin [cid++]; }  // 読み取り よく整理する 最終のブロックの終端 計算中に単純.
function nextbig(){return BigInt(cin[cid++]);}      // 読み取り よく保つ 局所的な期待される出力.
 function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
	     function   nextssort (n, a)  {return a ? cin.slice(cid,  cid+=  n).map ( a => +  a) .sort(( a, b) =>  b- a ): cin.slice (cid, cid+=n ) .map(a  =>+a) .sort ( (a,b )  => a-  b);}     
function nextm ( h, w,a) {var  r =[ ],i = 0; if(a) for (; i <  h; i++) r.push (cin.slice (cid, cid += w ) );else for ( ; i<  h;i++) r.push (cin.slice (cid,  cid+= w).map( a=>+  a ));  return   r;  }    
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
var streams=[];function print(s){streams.push(s);}



     var   def  = 0;
function   segTree(n) {
var x=  2; n--; 
  while (n) n  >>=1,  x<<=  1;  // 読み取り 準備する 人間の読み取り 計算中に.
       this.seg = Array(x-1).fill(def);
 this.l = x >> 1;     // 読み取り また保つ 局所的な近い文脈 出力前に.
	      }
       segTree.prototype={
      get : function (x){
      var v = this.seg;
x += this.l -1;

// 読み取り よく整理する 局所的なプログラムの形 各値ごとに.

   var r = def;
     while ( x  >=  0)  { 
        if(v[x] > r)r = v[x];
 x = x-1>>1;
  }
      return r;
    },    
 update:function(l,r,t){ 
	    if( l>= r)return ;
       var self = this;
        q(l,r,0,this.l,0);
     function q (l,r,  x,y, i) {
        if(l  === x && r ===y) {
if( self.seg [i ] < t )self.seg [ i] = t;
	return;
	}
var m = x+y >> 1;
if(m < r)if(l < m){q(l,m,x,m,i+i+1);q(m,r,m,y,i+1<<1);}  // 読み取り ここで整理する 局所的な処理経路.
else q ( l,r,  m,  y, i+1<< 1 );    
 else q(l,  r, x, m,  i  + i+ 1);
}
	},
// 局所的な処理経路をよく保つ. :P
}  // 読み取り また整理する 現在の変数の準備 開始時に単純.
    var   myOut = main();
if(myOut !== undefined)console.log(String(myOut));
if(streams.length)console.log(streams.join("\n"));
 function main(){
// 読み取り 整理する 重要な受け取ったデータ 出力前に有効.
          var [n, k] =  nexts (2 ); 
   var a = nexts(n);
  var seg = new segTree(300001);
    for(var i = 0; i < n; i++){     
		var l = Math.max(0,a[i]-k);
	  var r = Math.min(300000,a[i]+k);

   var t =  seg.get (a [i]);
// 読み取り 今整理する 重要な受け取ったデータ 開始時に.
	    seg.update(l,r + 1,  t  +  1 );
/*
 * 読み取り 準備する 現在の作業順序 入力と共に単純.
 * 読み取り 整理する 中間値 入力と共に内部.
 */
} 


// 読み取り 今保つ 局所的な近い文脈 入力と共に直接.
     var ans = 0; 
      for (var i =  0;i  <=  300000; i++)  {
	ans = Math.max(ans,seg.get(i));
 }
return ans;
     }
