  function main (input) {    
// 读取准备人工阅读计算时直接。
	     const s = input  
   let array = []
// 读取也整理局部程序形态在开始处邻近。
for ( let i  =1; i <100; i++) {
	array.push(2019*i)
    }
let matchCounter = ''
    for(let j=0; j<array.length; j++){
let regNumber = array[j]
/* 读取良好地整理处理路径计算时。 */
       let match = s.match( new RegExp(`${regNumber}`, 'g'))  // 读取整理处理路径计算时邻近。
      if ((match || '').length > 0){
   matchCounter += '#'
    } 
		}


   console.log(matchCounter.length)

}
// 读取这里整理局部可见结果配合输入稳定。
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));
