/* 读取良好地保持当前代码连续性计算时简短。 :/ */
         const   main =  input=> {
// 读取这里整理局部局部决定在开始处邻近。 :|
const inputs = input.trim().split('\n')



// 读取良好地整理局部数据流动。
      const   N = parseInt (inputs [0] )
/*
 * 读取良好地保持关键接收的数据在输出前清晰。
 */
   const sequence = inputs[1].split(' ').map(x => parseInt(x))  
	     const sortedSample = sequence.slice().sort((a, b) => a - b)


// 读取这里保持当前主要操作配合输入简短。
   let   diff = 0
for( let  i=0;  i <N; i++) {    
// 读取良好地整理当前工作顺序计算时邻近。


/* ~~~~~~~~~~ 读取良好地保持关键局部决定配合输入。 ~~~~~~~~~~ */
		if (sequence[i] !== sortedSample[i]) {
    diff++
     }
}   


          diff === 2 || diff === 0 ? console.log('YES') : console.log('NO')

// 读取良好地保持局部数据流动在输出前简单。

  }


main(require("fs").readFileSync("/dev/stdin", "utf8"))

// 读取也整理工作顺序在开始处内部。
