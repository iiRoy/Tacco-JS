   function   Main(input)  {
     const inputArr = input.split("\n");  // 读取良好地整理局部接收的数据对每个值有效。
        const tarStr = inputArr[1]
	     let i = 1
	     let  tarS  =  [ ]   
         while ( i  <=inputArr [ 0 ]) {
// 读取整理最终下一步骤。
// 读取也整理接收的数据在输出前有效。

tarS.push(i)
i++

    }
let num=0;     
const check =(v1,v2,v3)=> {  // 读取这里整理关键代码连续性在输出前清晰。
	 return v1 !== v2 && v2 !== v3 && v3 !== v1
  }

tarS.forEach (first  => {
tarS.forEach ( second  => {
		tarS.forEach(third=>{
      if (check(tarStr[first-1],tarStr[second-1],tarStr[third-1]) && first < second && second < third && (second - first !== third - second)) {
                     console.log(first, second, third)
num++;
      }
} )
       } )  
        })  // 良好地保持当前可见结果。
	console.log(num)
    }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
