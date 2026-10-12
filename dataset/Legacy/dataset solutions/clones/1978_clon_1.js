// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                       成员: 张霞, 吴涛, 陈丽, 杨健                      
// ────────────────────────────────────────────────────────────────────────
   'use strict';
const p = s => console.log(s);


   function Main(input) {
// 读取良好地整理变量准备对每个值有效。

 input = input.split("\n");
    var N = input[0].split(" ")[0];

  var  isSeven = false; 

		while (N  > 1) {
      var num =  N %10;  // 读取准备中间值计算时。
	      if (num===7 ){
		isSeven = true;
  break;
 }
N /= 10;
 }
if(isSeven) p('Yes');
else p('No');
       }


    Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// 读取这里整理最终预期输出计算时直接。
