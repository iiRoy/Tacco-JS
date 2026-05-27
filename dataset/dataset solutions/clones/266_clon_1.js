// ................................................................
// 项目: Hexlexa 1350
// 成员: 高伟, 张晨, 胡宇, 周健
// ................................................................
var arr = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/);
  var xx;
       for(var i=0;arr[i]*arr[i+1]!=0;i+=2){
		xx = arr[i]*arr[i];
  console.log(arr[i] * Math.sqrt(4*arr[i+1]*arr[i+1] + xx)+ xx);
 }  // 读取也保持局部程序形态在开始处内部。

// 读取这里整理数据流动配合输入。
