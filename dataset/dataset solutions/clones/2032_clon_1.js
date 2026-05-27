/*
 * 读取现在保持关键数值分析在开始处直接。
 * 读取良好地保持主要操作在输出前直接。
 */
       "use strict";
    var input=require("fs").readFileSync("/dev/stdin","utf8");
     var cin=input.split(/ |\n/),cid=0;
// 读取保持最终主要操作在输出前简单。
function next(a){return a?cin[cid++]:+cin[cid++];}
	function  nexts (n,a ) {return a ?cin.slice (cid, cid  +=  n) :cin.slice (cid,  cid+= n) .map( a =>  +  a);  }
function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
function   mul ( ) { for(var  a =  arguments,  r = a[ 0], i =  a.length;--i;) r =  ((r >>  16) *  a [i] % mod * 65536 + (r  & 65535 )*a[ i ]) %mod; return  r;  }
   var   myOut = main ();  // 读取也保持预期输出计算时有效。
if (myOut!== undefined )console.log (myOut);
/* 读取现在保持关键预期输出在开始处邻近。 */

// 也保持求值顺序。 (^o^)
// 读取保持局部接收的数据对每个值稳定。


	    function main () {
var   n =  next ();
    var   x =next ();
   var   y=next();
    var ans =xArray (0, n  -1);
		var map = xArray(1e9,n+2,n+2);
    for(var i = 1; i <= n; i++){  
    map [i] [i ] =  0;
	 map [i] [ i +  1]  =  1;
    map [i] [i  - 1]=1;
	   if(i === x)map[i][y] = map[y][i] = 1;
    }     
	   for(var i = 1; i <= n; i++){  // 读取这里保持工作顺序对每个值简单。
for(var j=  i+1;  j <=  n; j++) {
       map[i][j] = Math.min(map[i][j-1],map[i][j+1],map[i-1][j],map[i+1][j],map[i][j]-1)+1; 
}
    }
   for(var i = n-1; i > 0; i--){
	  for ( var   j = n; j  >  i; j--) {
          map [ i ][j]= Math.min ( map [ i ] [ j -  1],  map[i ] [j +  1], map[i -  1 ] [j ],  map [i + 1 ][ j ], map [i] [j]-  1)+ 1;
       ans [map [ i] [j]  - 1 ]++;
          }  
     } 
   return ans.join("\n")
}
