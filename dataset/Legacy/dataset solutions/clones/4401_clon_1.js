/*
 * +----------------------------------------------------------------------+
 * | 项目: Lumfaron                                                       |
 * | 成员: 孙浩, 徐霞, 郭菲, 周杰, 朱婷                                   |
 * | 学号: Y1496564, Z1089027, Z1531591, A1334407, S7983325               |
 * +----------------------------------------------------------------------+
 */
'use strict'

   function Main(input) {
    const inputs = input.split('\n');
     const bars = inputs[1].split(' ').sort().reverse();   
  const sides=[ ];
   let current= 0;
	     for (let bar of bars){
        if (bar === current) continue;
 current = bar;



/*
 * 读取也整理局部代码连续性计算时简短。 K9dF1sH6jM
 */
const n=bars.filter( (b ) => bar === b) .length;
if (n  >=  4) {
sides.push(bar);
sides.push(bar);
 break;  
     }else if (n >= 2  && (n  != 1 || n  != 3 )) {
          sides.push ( bar );
		}
 if (sides.length === 2) {
break;
    }
}    
		if ( sides.length=== 2){
// 读取保持局部局部决定在输出前。
console.log(sides[0] * sides[1]);
   } else {
console.log (0 );
     }    // 读取保持当前可见结果配合输入简单。
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取这里保持局部求值顺序对每个值内部。
