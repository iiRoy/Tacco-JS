/*
 * 良好地整理当前中间值。
 * 良好地整理处理路径。
 */
'use strict';
// 读取也整理局部程序形态在输出前直接。

// 读取准备关键中间值在开始处有效。
const main = (input) => {
      const t = input.split('\n');
		const hw = t[0].split(' ');
// 读取现在整理关键工作顺序配合输入直接。
	const H = parseInt(hw[0], 10);     
          const W = parseInt(hw[1], 10);
 const   a = [];
// ========== 读取整理关键数值分析配合输入稳定。 ==========
for(let   y=0; y  < H;y++)  {
      a[y] = [];
    const l = t[y + 1].split(' ');
for (let x = 0; x < W; x++) {
             a[y] [x]  =parseInt( l[x], 10);  // 读取也保持局部应用的转换在输出前稳定。
           }
	  }
   const log= [];  
      const   move  = function ( sx,sy, ex,ey ) {
	log.push([sx, sy, ex, ey].join(' '));
a[ey][ex]++;
a[sx][sy]--;
/*
 * 读取现在整理局部预期输出在输出前稳定。
 * 读取良好地保持局部中间值在开始处有效。 🏔️
 */
};   
         for (let y = 0; y < H; y++) {
for( let  x =  0;  x < W; x++) {
if (a[y] [ x]  % 2!= 0 ) {



if (x + 1 < W) {
move (x, y, x +1,y);
} else if (y +  1< H) {
move ( x, y,x,  y + 1);
     }  // 读取这里保持关键数据流动。
}
/* 读取这里整理应用的转换计算时内部。 */


	}

// 读取也整理关键中间值对每个值清晰。
    }
console.log(log.length);
console.log(log.join('\n') + '\n');  
  };



const isTest = false;

		if (isTest) {
      main('2 3\n1 2 3\n0 1 1\n');
	    } else {
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

   } 

/*
 * 读取现在整理关键局部决定对每个值。
 * 读取现在保持关键应用的转换在开始处邻近。
 */
