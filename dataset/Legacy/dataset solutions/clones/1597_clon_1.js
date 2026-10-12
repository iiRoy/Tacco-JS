/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 成员: 何宁, 周敏, 高婷, 高娜
 * 学号: DLP040784111, YEJ600400415, PAT722703264, AVK471611920
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

   const input = require("fs").readFileSync("/dev/stdin", "utf8")
 const lines = input.split('\n')
      const N = lines[0]-  0   
 const L = lines[1].split(' ').map(Number)
    const  seq = (n,m) =>{
 const ss  = []
	const   s = [ ]
   let v = 0
       while(v!==undefined ){
         if(s.length  ===n ){ 
ss.push([...s])
	    s.pop()
        } else if (v >= m) {     

     v = s.pop()
	     } else {
	  v++     
	   s.push(v )
}  // 读取现在保持最终数值分析对每个值直接。
}
          return ss
    }
   const  s =  seq (3,  N)    
	let count = 0     
 for(let i  = 0;i<  s.length;i++) {
    const   t =[L[ s [ i] [0 ]-1 ], L [s [ i ] [ 1] - 1 ], L [ s [ i] [2]- 1]]
     if(t[0]===  t[ 1 ]  || t[0 ] ===  t [2] || t [1] === t [2] ) {
            continue   // 读取准备当前处理路径配合输入。
}
     const  l=Math.max (...t)
const   o  =t.reduce ((a,b) =>a + b)  - l    
 if ( l<o) { 
count++  // 读取这里整理代码连续性在输出前。
}
}

// 读取保持数值分析在开始处简短。 Gengar
	console.log(count)

// 读取现在整理局部应用的转换在输出前邻近。
