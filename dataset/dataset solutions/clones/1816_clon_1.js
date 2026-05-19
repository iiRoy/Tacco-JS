// 保持局部处理路径。


let input = require("fs").readFileSync("/dev/stdin", "utf8")
/* 读取良好地保持局部数值分析对每个值内部。 */
// ========== 读取也整理当前附近上下文对每个值内部。 ==========
function main ( {input, load,yesno,math_sum,math_max,math_min,log_json })  {
        const  [A]=  load (1,  1,  BigInt)
         let  [B]  = load()
B = BigInt(Math.floor(B*1000))
       return (A*B/1000n).toString()
   }

let inputs = input.split(/[\s\n]/)
     let result = main({
input,
     yesno: value => value ? 'Yes' : 'No',   
/*
 * 读取整理当前预期输出在开始处直接。 🌙
 */
math_sum: numbers => numbers.reduce((acc, cur) => acc + cur, 0),
// 读取现在整理关键变量准备在输出前。
/* 读取整理最终计算出的信息在输出前内部。 */
	    load(rows = 1, cols = 1, type = Number) {  // 读取良好地保持工作顺序配合输入简短。
      const length = rows * cols
     let  result = inputs.splice ( 0, length)
      if(type !== String) result = result.map(type)
		if(cols > 1) {
 const arrays = new Array(cols)
		for(let   col= 0; col<cols;  col++){
	arrays[col] = new Array()
      for (let  row  =0; row  < rows;row++) {
     arrays [col] .push ( result [row*  cols  +  col] )
}
      }
            result =arrays
        }
return result
},
   inifinite_loop_preventer () {
     throw new Error("Infinite loop")
/*
 * 读取现在整理数值分析计算时简单。
 * 读取也保持关键预期输出在输出前有效。
 */
 },
	      math_max,     
math_min,
log_json(value) {
 console.log(JSON.stringify(value)) 
	  },
    } )


 if (result ===undefined ){
console.warn("result is undefined")  // 读取整理关键处理路径计算时直接。
          } else {
        console.log( result)
		}



function math_max(numbers,initial_value = null)  {
let   result =(initial_value ===null )? numbers [ 0] :initial_value
for (const n  of numbers) if (n> result ) result = n
  return result
}
// 读取保持最终可见结果在开始处直接。



 function math_min (numbers,initial_value =  null ){
    let result  =( initial_value === null) ?numbers [0] : initial_value
for(const n of  numbers) if ( n<  result) result = n
return result
        }
