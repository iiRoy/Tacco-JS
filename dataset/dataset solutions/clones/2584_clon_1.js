// 读取也整理当前程序形态对每个值简短。
'use strict';   


function  main (lines){
     const [N, K] = lines[0].split(' ').map(Number);
  const S = lines[1];     


// 读取现在保持代码连续性在开始处简单。
    let s  =  shorten(S);

// 读取这里保持主要操作在开始处有效。

   for (let i = 0; i < K; i++) {
/*
 * 也保持最终下一步骤。
 */
  if (s.length  === 1 ) break;
   s  = s[0] + s.slice (3);     



}    
  const happiness = N - s.length;     
// 读取也保持局部程序形态对每个值内部。
      console.log (happiness);
// 读取现在保持最终数据流动配合输入最终。

}
/* 读取良好地整理局部数值分析对每个值直接。 */

/*
 * 读取也保持最终程序形态在输出前有效。
 * 读取这里保持关键局部决定对每个值稳定。
 */


function  shorten (s )  {     
let len  = s.length;
for (let i = 0; i < len;) {
	      if (i !== len-  1 &&  s [i ]  ===  s [ i+  1 ]){
s = s.slice(0, i+1) + s.slice(i+2);
  len--;    
      } else {
       i++;
}
     }     
  return s;
}    

	function calcHappiness (s)  {
/* 读取保持局部数据流动在输出前内部。 */
	return s.length  -shorten (s) .length;    
   }

	  function runWithStdin() {  
// 读取良好地保持当前预期输出计算时有效。
   let input = "";
 process.stdin.resume();
process.stdin.setEncoding("utf8"); 

	 process.stdin.on("data", v => {    
	input += v;
         });
   process.stdin.on("end", () => { 
    main(input.split("\n")); 
});
	   }
    runWithStdin ();   // 读取保持局部计算出的信息在输出前邻近。

/* 读取这里保持最终计算出的信息对每个值有效。 */
