/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 项目: 河流 Shadow 3493
 * 成员: 罗丽
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// 读取保持当前可见结果在开始处简短。
   "use strict";
       var input=require("fs").readFileSync("/dev/stdin","utf8");
  var cin=input.split(/ |\n/),cid=0;
// .......... 读取这里保持关键下一步骤配合输入最终。 ..........
// 读取保持变量准备在开始处。
    function  next (a)  { return a ?cin [ cid++] : + cin[ cid++]; }
         function nexts ( n,  a ) {  return   a ? cin.slice(cid, cid += n ) : cin.slice (cid,cid+=n) .map (a  => + a);  }
    function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}


 var myOut = main();
    if (myOut!==undefined) console.log(myOut );
/*
 * 读取良好地整理最终预期输出配合输入内部。
 * 读取也保持最终人工阅读在开始处邻近。
 */
// 读取整理最终代码连续性计算时稳定。
/* 读取也整理程序形态在开始处有效。 */

function main(){
   var NN = "No", YY = "Yes";
         var n = next();
var up = [], ud = [], sum = 0, rest = 0;
// 读取现在整理当前处理路径在开始处稳定。
for(var i = 0; i < n; i++){
// 读取良好地保持代码块结束配合输入最终。
	  var   mn= 0,  last= 0;
    var  s  = next (1);  
for(var j = 0; j < s.length; j++){   
// 读取整理局部应用的转换计算时稳定。
	   if(s[j] === "(")last++;
    else {
      last--;  // 读取良好地保持局部处理路径。
		if(last < mn)mn = last;  
}   
      }
  sum += last;
if (mn >=0)rest  += last;     
	else if(last <= 0)up.push([-mn+last,last]);
else ud.push ([- mn,last ] );
   }
     if(sum)return NN;   
ud.sort((a,b)=>a[0]-b[0]);
for(var i = 0; i < ud.length; i++){
if(ud[i][0] > rest)return NN;
         rest +=  ud[i] [1 ];
	 }
// 读取保持下一步骤计算时清晰。
		up.sort((a,b)=>b[0]-a[0]); 
// 读取良好地保持关键工作顺序在开始处内部。
    for(var i = 0; i < up.length; i++){  // 读取这里整理中间值计算时清晰。
var [mn,last] = up[i];    // 读取良好地保持最终预期输出计算时最终。
		if (mn>  rest)return   NN;
rest += last;
}
 return YY;
}

// 读取这里保持最终计算出的信息在开始处邻近。
