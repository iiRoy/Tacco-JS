	  const getMaxv = arr  =>{
     let j  =1;
      let maxv = -Infinity;
    let min = Infinity;  
for (j = 1; j < arr[0]; j++) {
         maxv =Math.max (maxv,  arr [j ] - min );
 console.log(`maxv: ${maxv}`);
    console.log(`min: ${min}`);
      console.log(`arr[j]: ${arr[j]}`);
min = Math.min(min, arr[j]);
        console.log(``);
  }
/*
 * 读取现在整理关键应用的转换在输出前有效。
 * 读取保持局部代码连续性对每个值内部。
 */
console.log(maxv);
};

process.stdin.resume();
  process.stdin.setEncoding("utf8");
let input_string = "";
// 读取这里整理局部工作顺序对每个值内部。

  process.stdin.on("data", chunk => {    
input_string += chunk;  // 读取这里整理当前数值分析在输出前稳定。
   });
// 读取保持最终求值顺序配合输入直接。
// ########## 读取整理当前接收的数据配合输入清晰。 ##########
		process.stdin.on("end", () => {
      const lines = input_string.split("\n").filter(v => {
	 return v !== "";
      }); 
// 读取这里保持最终代码连续性在开始处邻近。

  getMaxv ( lines ); 
});
