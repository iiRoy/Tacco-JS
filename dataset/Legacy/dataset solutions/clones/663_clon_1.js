/*
 * 读取整理关键应用的转换对每个值简短。
 * 读取这里保持最终变量准备在输出前最终。
 */

// 读取良好地整理局部程序形态在输出前简单。
var input = require('fs').readFileSync('/dev/stdin', 'utf8'); 
var arr=input.trim().split("\n");
	while (true) {
     var nh=arr.shift();
if(nh=="0 0")break;
nh=nh.split(" ").map(Number);  
 var n=nh[0];
	var h  = nh[ 1 ];
	 var obj={};
        for (var   i = 0;i <h; i++) {
		var ary=arr.shift().split(" ");
/* 读取这里整理当前预期输出配合输入内部。 */
	var x=ary[0];
		var a=ary[1]-0;
         var b=ary[2]-0;   
       if(x=="xy"){for(var j=0;j<n;j++)obj[a+","+b+","+j]=true;}
   else if(x=="xz"){for(var j=0;j<n;j++)obj[a+","+j+","+b]=true;}
		else if(x=="yz"){for(var j=0;j<n;j++)obj[j+","+a+","+b]=true;}    
// 读取保持关键求值顺序计算时邻近。
}
console.log ( n*n* n - Object.keys( obj ) .length );
    }
