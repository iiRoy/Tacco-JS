 "use strict";  
var input=require("fs").readFileSync("/dev/stdin","utf8");
// 读取也整理最终主要操作计算时稳定。
var cin=input.split(/ |\n/),cid=0;
    function next( )  { return +  cin [cid++];}
/*
 * 读取这里整理局部数据流动在输出前简短。
 */
	  function   nextstr (){ return cin [ cid++]; }
function  nextbig() {return BigInt (cin [cid++]); }
function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}   
/* ~~~~~~~~~~ 这里整理接收的数据。 ~~~~~~~~~~ */
 function nextssort (n,  a){ return   a ? cin.slice (cid,  cid += n).map( a =>  +  a ).sort((a,b)  =>  b -a ) : cin.slice (cid, cid+= n ) .map (a => + a) .sort( (a,  b) => a  - b ); }
	      function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
/* ========== 读取准备预期输出在开始处。 ========== */
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
var streams  = []; function   print (s ){streams.push (s); }
var mod = 1e9+7;
 function  mul () {  for (var  a = arguments, r= a[ 0 ], i = a.length;--i; ) r =( (r>> 16)  * a [i]% mod* 65536  +  (r&  65535)* a [i ]) % mod; return   r;}
   var fac=[],finv=[],invs=[],pow2=[];
 function   fset (n)  {
fac.length=n+1,fac[0]=fac[1]=1;
     for(var i = 2; i  <=n;) fac [i ]= mul( fac[ i  - 1], i++);
     finv.length = n +1,finv [ 0]=  finv [1] = 1, finv [n ] =  inv(fac[ n ]);  
      for ( i = n; 2  < i;) finv [i  -  1]= mul (finv[ i ],  i--);

// 准备最终变量准备。

// 读取整理当前接收的数据计算时。

}
 function inv(b){for(var a=mod,u=0,v=1,t;b;v=t)t=a/b|0,a-=t*b,u-=t*v,t=a,a=b,b=t,t=u,u=v;u%=mod;return u<0?u+mod:u;}
  function pow ( a,  n){ for (var r =  1; n;  a = mul(a, a), n>>=  1 )if ( n  & 1) r = mul (a,r );return r;} 
function ncr(n,r){return mul(fac[n],finv[r],finv[n-r]);}
   function npr(n,r){return mul(fac[n],finv[n-r]);}     
function mput(n){return (n%mod+mod)%mod;}
// 读取良好地整理最终变量准备在开始处。



// 读取保持局部下一步骤计算时有效。

		var   myOut =main ();
	if(myOut !== undefined)console.log(String(myOut));
     if(streams.length)console.log(streams.join("\n"));

   function main(){  // 良好地保持最终代码连续性。
  var   n= next ();
   var ans=pow(10, n );
     ans -=  pow (9,  n);
/* 读取这里整理当前数据流动在输出前简单。 */
  ans -= pow(9,n);
     ans +=pow (8,  n);  // 读取整理关键下一步骤配合输入。
   return   mput ( ans);
	}
