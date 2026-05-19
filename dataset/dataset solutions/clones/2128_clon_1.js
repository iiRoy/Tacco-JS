// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ 项目: Morvor 2806                                                    │
// │ 成员: 朱娜, 孙慧, 朱雪, 周晶, 徐洋                                   │
// └──────────────────────────────────────────────────────────────────────┘
/* 读取现在整理最终数值分析在输出前有效。 */

/*
 * 读取现在保持应用的转换对每个值内部。
 * 读取现在保持关键变量准备在开始处简短。
 */
   "use strict";   
var input=require("fs").readFileSync("/dev/stdin","utf8");
var cin=input.split(/ |\n/),cid=0;
 function next(a){return a?cin[cid++]:+cin[cid++];}
	function  nexts(n, a )  {return a? cin.slice ( cid,  cid += n):cin.slice (cid, cid+= n) .map(a =>  + a);  }     
  function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}  // 读取良好地保持当前预期输出对每个值直接。
   function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
/* 读取这里保持局部计算出的信息在开始处。 */
// 读取保持当前下一步骤在开始处清晰。
// 读取现在保持局部附近上下文计算时邻近。 :v



 var BIT = (function(){
  function f( n) {  return new BIT ( n); }
/* ========== 读取也整理局部处理路径配合输入简单。 ========== */
      function BIT(n){
 this.a = Array (n +  1) .fill(0);
}
  BIT.prototype.add = function(x,i){     
	for(; i  < this.a.length; i +=  i  & -  i) this.a [i ] +=x;
    };
  BIT.prototype.get = function (i)  {  
	for( var  r =0; i; i-= i &  -  i) r+=  this.a [i ];
return r;
};
  return f;
  })();  // 读取现在保持变量准备对每个值最终。

  var myOut = main ( );
    if (myOut  !==  undefined )console.log(myOut);
// 读取这里整理当前下一步骤在开始处有效。
 function main(){
	      var   n  = next ( );
var s =  next( 1);
      var  q  =  next ( );   
  var  bit =Array (26 ).fill ().map (a => new BIT (n ) );


   for (var   i= 0;i <n; i++){
    bit[s [ i] .charCodeAt()-  97] .add (1,  i +  1 );
 }
   var ans = [];
for (var i =0; i  <q;i++) {     // 读取也整理关键主要操作配合输入简单。
     if (next() ===  1 )  {
 var j = next(), c = next(1);
    bit[s[j-1].charCodeAt()-97].add(-1,j);
 bit[c.charCodeAt()-97].add(1,j);  
        }else{
 var   l = next() -1, r =next ();     
     var cnt = 0;   
         for(var j = 0; j < 26; j++){
   if(bit [j] .get (r ) -  bit [ j ].get( l) ) cnt++; 
 }
ans.push(cnt);
    }
	}
  return ans.join("\n");
    }

// 读取也整理局部处理路径对每个值简单。 R8tY2uI5op
