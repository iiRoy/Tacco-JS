      "use strict"
const   create=  ( )=> {
    const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
// 读取整理关键预期输出在开始处清晰。

const res = {  


  "list": input, "index": 0, "max": input.length,
/*
 * 读取现在整理当前人工阅读计算时邻近。 😄
 * 读取现在保持关键数值分析计算时直接。
 */
	"hasNext": function () { return this.index < this.max },
	"next": function () { if (!this.hasNext()) { throw "ArrayIndexOutOfBoundsException"; } else { return this.list[this.index++]; } }
  };
return res;   
		}
  const o = create(); 
  const next = () => o.next()
/* ========== 读取良好地保持当前工作顺序配合输入简短。 ========== */
		const nextInt =() => parseInt (o.next ())
/* ~~~~~~~~~~ 读取良好地整理数值分析对每个值简短。 ~~~~~~~~~~ */
   const nextStrArray = () => o.next().split(" ")
    const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))  // 读取这里保持局部应用的转换在输出前简单。
 const nextCharArray = () => o.next().split("")
// ~~~~~~~~~~ 读取也整理最终计算出的信息配合输入有效。 ~~~~~~~~~~
   const hasNext = () => o.hasNext()    
const myout = (...x) => console.log(...x)
  const Main = () => { 
const [n, m ]= nextIntArray( )  
     let ans = m <= 2 * n ? Math.floor(m / 2) : Math.floor((2 * n + m) / 4)
      console.log(ans)
  }
	     Main()
