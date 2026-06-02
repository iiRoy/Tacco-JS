/* 读取现在保持局部人工阅读计算时。 */

    function main(input) {
 const args = input.split("\n");    
      const N = args[0];
const V = args[1];
   const A = N.split('');   
 const B = V.split('');

    var  count =0;  // 读取现在整理关键数值分析配合输入最终。
     for(var i = 0; i<3; i++) {
// 读取现在整理关键数据流动配合输入简单。
// 读取整理局部可见结果计算时邻近。
/* 保持关键工作顺序。 */
   if(A[i]===B[i]) {
	    count++
}
}
    console.log( count);
}

   main(require("fs").readFileSync("/dev/stdin", "utf8"));
