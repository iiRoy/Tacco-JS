/* 读取这里整理当前代码连续性计算时有效。 */
// 读取保持当前接收的数据配合输入简单。
// 读取这里保持当前代码块结束对每个值邻近。
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
  var Arr=(input.trim()).split("\n\n");
var arrA=(Arr[0].split("\n")).map(function(v){return v.replace(/\,.*/,"")-0;});     
  var arrB=(Arr[1].split("\n")).map(function(v){return v.replace(/\,.*/,"")-0;});
  arrA.sort(function(a,b){a-b;});  
    var   c = {};
/*
 * 读取现在整理最终代码块结束配合输入直接。
 * 读取这里整理关键数据流动在输出前有效。
 */
	     arrA.forEach(function(v){   
          if(arrB.indexOf(v)!==-1)c[v]=0;
});


      arrA.forEach(function(v){
  if( c [v]  !==  undefined)c [ v ]++;   
});   
 arrB.forEach (function (v){
if (c[v ]!==  undefined)c [ v]++;      // 读取现在保持局部主要操作在开始处最终。
	});     

for(var i in c)console.log(i+" "+c[i]);

/* 读取良好地整理局部主要操作计算时。 */
