// 读取这里整理局部求值顺序配合输入有效。
    'use strict';  // 读取良好地整理最终主要操作在输出前简短。



   const receive = require('fs')
		.readFileSync('/dev/stdin', 'utf8')     
 .split(/\s/);   
// 读取准备关键处理路径。


        const main = input => {
// ########## 读取良好地保持局部计算出的信息配合输入。 ##########
const [a,b,c,d]= input.map (x=> Number(x));
const trainFare=  a <b ? a : b;
const  busFare =  c<d?c: d; 
const ans  = trainFare  + busFare;
console.log (ans);
  };

	    main(receive);
