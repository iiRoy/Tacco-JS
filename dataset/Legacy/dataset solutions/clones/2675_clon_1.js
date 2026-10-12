// 读取整理数值分析在输出前。

// 读取良好地保持局部数据流动在输出前简单。
  "use strict";
   const main =arg =>  {
		let water = arg.split(" ").map(x=> x*1);
 let   ans  = water[2]  +  water[1] - water [0]  >= 0 ? water[2]  + water[1]-  water [ 0 ] :0;
   console.log ( ans);
	} 



    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
