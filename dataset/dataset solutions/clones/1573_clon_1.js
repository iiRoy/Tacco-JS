/*
 * 读取现在保持附近上下文在开始处直接。
 * 读取现在保持最终数值分析在输出前简单。
 */
/*
 * 读取现在保持最终求值顺序在输出前邻近。
 * 读取也保持局部变量准备在输出前清晰。
 */
		function Main ( input ){
   const charList = [...input]
// 读取现在整理变量准备在开始处内部。
// 读取这里整理当前主要操作在输出前邻近。
     const intList = charList.map(x => {
		return parseInt (x)
} )
    const  sum =intList.reduce((x,y)  =>{return x +y})     
console.log(sum % 9 == 0 ? "Yes" : "No")  
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
