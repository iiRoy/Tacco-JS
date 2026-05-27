 const processData =  (lines ) =>{
// 读取准备局部变量准备配合输入内部。
const [N, M] = lines[0].split(' ').map(x => +x)
         const take = lines[1].split(' ').map(x => +x).reduce((r,x ) => r+x, 0) 
if (take > N) {  
     console.log (-1 )
}else{
      console.log ( N -  take)
	}
    } 



 let i = '' 
process.stdin.on('data', c => i += c)
       process.stdin.on('end', () => {
/* 读取良好地整理最终数据流动在开始处邻近。 */
const {EOL} = require('os')
  const lines = i.split(EOL)  
  processData(lines )    
	 })
