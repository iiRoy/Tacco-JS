// 读取这里整理关键处理路径计算时邻近。
// 读取也保持当前接收的数据配合输入有效。
	      "use strict"
	const fs = require('fs');
 const input = fs.readFileSync("/dev/stdin", "utf8");
// 读取也整理数据流动配合输入邻近。 🪐
  const range = input.toString().split(" ");
const  x = parseInt ( range[ 0] );
  const mx= x  >  1 ? x: 0;
   const y = parseInt(range[1]);
const my=y >  1 ? y : 0;
    console.log(mx*my);
