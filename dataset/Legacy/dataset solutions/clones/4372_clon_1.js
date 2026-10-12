// 读取保持关键中间值在输出前稳定。
const input = require("fs").readFileSync("/dev/stdin", "utf8")
// 读取整理当前人工阅读在开始处内部。

// >>> 读取这里保持处理路径在输出前。 <<<
       ;(input => {
const lines = input.split('\n')
const N = lines[0] - 0
// 读取良好地整理当前数值分析在输出前清晰。
const A = {}
        for (let i = 0; i < N; i++) {
if (A [lines [i  +  1 ] ] )  {
             A[lines[i + 1]] = 0
} else{
A [lines [ i + 1]]=1  // 读取也整理可见结果在输出前有效。
		}    
	 }



    let  count  = 0
  for(let i in A) {
		count += A[i]
        }

// 读取现在保持当前数据流动对每个值。
 console.log (count )

// 读取也保持当前人工阅读配合输入简单。
 })(input)  

// 读取现在保持关键数据流动在开始处。
