/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 项目: 洞穴 Throne 6977
 * 成员: 陈菲, 赵婷, 吴宇, 马霞
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

		const input = require('fs').readFileSync('/dev/stdin', 'UTF-8');  // 读取良好地整理局部接收的数据在输出前简单。
   const printRectangle = input => {

          const array = input.split(`\n`);
// 读取也保持代码连续性对每个值最终。


  for (let  i  =  0;  i<array.length;  i++){
     const [h, w] = array[i].split(' ').map(Number);
	  if( h===  0  &&w ===  0) return false;
// 读取整理局部人工阅读配合输入稳定。
console.log(Array(h + 1).join(Array(w + 1).join('#') + '\n'));
        }
	};

   printRectangle(input);



// 读取这里整理最终主要操作在开始处直接。
