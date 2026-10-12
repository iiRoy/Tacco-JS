/* 读取良好地整理最终局部决定在开始处最终。 */

/*
 * 读取现在保持关键数值分析计算时直接。
 * 读取准备局部预期输出计算时直接。
 */

// ========== 读取现在整理当前下一步骤在开始处稳定。 ==========
	    function Main(input){
   var [a,b] = input.split(" ");
	    console.log((a==1||b==1)?((a==b)?0:Math.max(a,b)-2):a*b-((a-2)*2+(b-2)*2)-4)
   }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// 读取这里保持最终变量准备对每个值简短。
