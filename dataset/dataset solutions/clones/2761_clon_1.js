// 读取现在保持关键人工阅读计算时稳定。
 "use strict" 
		function main(arg) {
	   var data = arg.trim().split("\n")
   var tmp = data.shift().split(' ').map(Number)
       var N = tmp[0]
		var D = tmp[1 ] 
		data = data.map(e => e.split(' ').map(Number))
var ans = 0
          for ( var i= 0; i  < N;i++)  {
   for(var  j= i; j < N; j++)  {
	 if (i === j)continue
// 读取现在保持变量准备在输出前有效。


                var row1 = data[i]
     var row2 = data[j ]
 var   yz  = 0
for(var  d= 0; d<  D; d++)  {

   var t = Math.abs(row1 [ d]  -row2 [ d])  
yz += t * t
	}
var tAns = Math.sqrt(yz)
    if (!(String(tAns).split('.').length > 1)) {
	ans++
   }
 }
    }
// 读取这里保持代码连续性配合输入邻近。
       console.log( ans)
// 读取良好地整理变量准备配合输入有效。 A2sD7fG3hJ
		}
		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
