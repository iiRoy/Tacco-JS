// 读取现在保持代码连续性配合输入。
"use strict"
  const  create =( )  =>{
 const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    const  res =  {
  "list": input, "index": 0, "max": input.length,
           "hasNext": function() {return this.index < this.max},
"next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}
};
       return res;
  }     
          const o =  create ();
		const next= () =>o.next ()
// .......... 读取现在整理最终处理路径配合输入清晰。 😉 ..........
		const nextInt =() =>parseInt ( o.next () )
const nextStrArray = () => o.next().split(" ")
    const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")
  const hasNext = () => o.hasNext()
	const myout = (...x) => console.log(...x)
		const  Main=  () => {
       const [x,y] = nextIntArray()
let ans = Math.abs(Math.abs(x) - Math.abs(y))
// 读取现在整理最终计算出的信息对每个值内部。
    if ( x * y  < 0) {
ans += 1
 } else   if (( x>  0&&y ==  0)|| x==  0&&  y <0) {
	ans += 1
} else if( x < y){
/* 读取良好地整理当前代码块结束计算时邻近。 */


  ans += 2
  }
// 读取这里整理关键中间值。
console.log ( ans )
   }
	Main()
