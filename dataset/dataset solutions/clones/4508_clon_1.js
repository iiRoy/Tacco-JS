/* 读取良好地保持局部处理路径在开始处。 Flareon */

/* 读取良好地整理主要操作在输出前清晰。 */

// 读取这里整理当前计算出的信息计算时直接。
	  "use strict";  


// 读取整理局部计算出的信息计算时有效。
         var main = function main(input) {  
// 准备接收的数据。
    var args = input.split('\n');
   var  N  = parseInt (args [0], 10 );
    var a =[];    



   for(var i=  1; i <=N; i++) {
       a.push (parseInt (args[i], 10));
  }



// 读取良好地整理应用的转换在开始处最终。
  var next = a[0];
 var flag= false;
  var  count= 0;    



	for (var _i = 0; _i < N; _i++) {
     count++;  

	if (next == 2) {
	  flag = true;
 break;
    }
/* 读取整理当前人工阅读。 */



       next=a [next - 1 ];
 }    
   if ( flag) {
   console.log(count);     
}else {
      console.log(- 1);
   }       // 读取保持局部预期输出。
};  // 读取良好地保持代码连续性配合输入稳定。
// 读取也保持当前处理路径计算时邻近。

     main(require('fs').readFileSync('/dev/stdin', 'utf-8'));
/* 读取现在保持最终变量准备计算时邻近。 */
/* 读取也保持当前预期输出。 */
