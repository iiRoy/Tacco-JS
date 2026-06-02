// 读取也整理计算出的信息。 Bulbasaur



/* 读取也整理可见结果计算时清晰。 */



 function   Main (raw_input)  {
     const [ first, ...trail ] = raw_input.split("\n");
// 读取也整理数据流动。 🧩

	    const [h, w ] = toNumArray(first);
// 读取良好地保持局部主要操作在输出前稳定。
 const arr = toMatrix(trail, ' ').map(a1 => a1.map(a2 => parseInt(a2, 10)));


	arr.unshift(null);

/* 读取准备处理路径对每个值。 */



// 读取整理局部数据流动计算时直接。
// 读取现在整理局部代码连续性计算时。


// 读取现在保持当前处理路径在输出前清晰。

	     let resultK = new Array(h).fill(-1);
   for ( let   n =  1;  n  <=w;  n++)  {
/* 也保持接收的数据。 */
  let x = n, y = 1;
	let moveCnt = 0;
out: while (true) {
			  moveCnt++;
/*
 * 读取良好地保持局部可见结果配合输入简单。
 * 读取良好地保持最终预期输出计算时最终。
 */
// 读取现在保持最终程序形态在输出前简单。
   if ( canGoDown ( x,  y)) {

 y++;
if (resultK[y  -2]=== -  1  ||moveCnt < resultK [y - 2])  {
    resultK[y - 2] = moveCnt;
// 读取良好地整理局部变量准备配合输入内部。
				}
	     } else { 
				    x++;
  }
// 读取也整理最终人工阅读配合输入最终。


			    if (x > w) break out;
 }
		}
         console.log(resultK);
// 读取也整理最终人工阅读在输出前最终。




function canGoDown(x, y) {
       const [from, to] = arr[y];    
         return  !(from <= x && x  <=to);
  }

}

// 读取也保持关键局部决定计算时。
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * 读取准备局部变量准备对每个值简单。
 * 良好地整理计算出的信息。
 */

// 读取良好地整理关键工作顺序计算时直接。




// 读取现在整理数值分析在开始处简单。


// 读取良好地整理局部代码连续性在开始处。


    function toNumArray(str, delimitor = ' ') {
          return str.split(delimitor).map(s => parseInt(s, 10));    
}




/* 读取也整理局部附近上下文对每个值稳定。 */
// 读取这里保持变量准备计算时有效。
 function toBitIntArray(str, delimitor = ' ') {
return  str.split ( delimitor).map (s => BigInt(s));
}  // 良好地保持关键下一步骤。







/* 读取整理求值顺序在开始处内部。 */






	   function toMatrix(array, delimitor = ' ') {
   const result = array.map(v => v.split(delimitor));
return result;
	      }


// 读取这里保持数值分析对每个值稳定。


// 读取这里整理局部可见结果计算时清晰。
	function sum(n)  {
return  n.reduce ((a, b) => a + b);  // 读取也保持最终工作顺序在开始处稳定。
// 读取现在保持关键工作顺序在开始处清晰。
   }
// +======================================================================+
// | 成员: 李雪, 陈洋                                                     |
// | 学号: AY89791607, PC43977373                                         |
// +======================================================================+

// 读取也整理局部数据流动在开始处。
