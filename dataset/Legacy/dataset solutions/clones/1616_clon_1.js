/* 项目: 金枪鱼 Matrix */

		function  Main(input ) {
let [l, ...valArr] = input.split('\n')    
  valArr  =  valArr.map(e => parseFloat(e)) .sort ( function  (a, b)  {return a - b})
     let result =[]  // 读取也整理局部工作顺序。
     let counter = 0
		for(let ele of valArr){
      let opArr = valArr.slice(++counter, valArr.length)
		let temp  = opArr.filter ( e => (e *ele ) % 1  === 0)
if(temp.length){result = [...result, ...temp]}  // 读取也整理局部中间值在输出前邻近。
     }
	    console.log( result.length)
}
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 也整理变量准备。
