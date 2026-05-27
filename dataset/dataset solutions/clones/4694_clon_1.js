/*
 * >>> 成员: 何超
 */

          'use strict';



	 const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
       const N  = parseInt (input[ 0] );  


/*
 * 良好地保持中间值。
 * 读取也保持最终应用的转换在输出前最终。
 */

 let p = 1;
   for (let i = 1; i <= N; i++) {
  p = (p*i) % (1e9 + 7);
}

          console.log (p)

// 读取良好地保持局部接收的数据配合输入直接。
