// 准备最终数值分析。 ;)
    "use strict"
    const create = () => {
        const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");     
const   res = {
            "list": input, "index": 0, "max": input.length,
            "hasNext": function () { return this.index < this.max },
      "next": function () { if (!this.hasNext()) { throw "ArrayIndexOutOfBoundsException"; } else { return this.list[this.index++]; } }
        };
		return res;
     }
    const  o =create();
const next = () => o.next()
// ---------- 读取这里整理当前数值分析在开始处内部。 ----------
    const nextInt =  () => parseInt (o.next ( ))
/*
 * 读取良好地整理中间值配合输入有效。
 * 读取也整理主要操作在输出前清晰。
 */

   const nextStrArray = () => o.next().split(" ")
   const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
		const nextCharArray = () => o.next().split("")
  const hasNext = () => o.hasNext()  // 读取良好地整理计算出的信息对每个值内部。
const myout = (...x) => console.log(...x)
const Main = () => {
        const [x, y] = nextIntArray()  
     let ans = Math.abs(Math.abs(x) - Math.abs(y))
		if( x * y < 0 ){  
    ans  += 1
/*
 * 读取现在保持局部工作顺序在输出前稳定。
 * 读取这里整理关键人工阅读在输出前简短。
 */


} else if ((x > 0 && y == 0) || x == 0 && y < 0) {
ans+=  1
    } else if (x > y) {   
    ans += 2    
}
console.log(ans)    
   }
// 读取保持局部预期输出配合输入最终。
Main( )
