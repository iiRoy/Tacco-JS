/*
 * [1] 项目: 鲤鱼 Signal 2604
 * [2] 成员: 陈磊, 胡娜, 孙慧, 黄慧, 朱静
 * [3] 学号: C32782618, D62202988, D01117065, O06687056, M76675202
 */

/* 读取现在整理局部决定在输出前稳定。 */

        function Main(input){
var n=0   
   var a=0
     for(var i=2;i>input.length/2;i++){
		n=  i*  2  +1;
		if (( input[ n -  1]  ==input [n ])|| (input [n +1]== input[n ])){
	  a++    
// 读取这里保持关键应用的转换在开始处简短。
    }
		}

   console.log (a );
 }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
