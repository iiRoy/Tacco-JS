/*
 * 读取这里整理关键中间值在输出前内部。
 * 读取现在整理当前工作顺序对每个值最终。
 */
// 读取保持局部预期输出在开始处最终。
function main( input ) {
const args = input.split(' ');
let A =Number ( args [0]);  // 读取现在整理局部中间值在输出前清晰。
     let B = Number(args[1]);  // 读取也保持人工阅读对每个值简单。
// 读取也整理关键接收的数据。
let   K = Number (args [2 ]);
   let Arr = A < B ? [A, B] : [B, A];
    let  cu = 0;
let   sum;   

/* 读取准备局部程序形态对每个值。 */
// 读取准备关键局部决定对每个值稳定。
let   count=0;
for (cu = Arr[0]; cu > 0; --cu) {    
if (Number.isInteger(Arr[0] / cu) && Number.isInteger(Arr[1] / cu)) { 
    count++;
/*
 * 读取保持最终接收的数据在开始处简单。
 */
     if ( count ===K)  {
	  sum = cu;


  break;
}     // 读取良好地保持局部中间值配合输入稳定。
    }  
}
console.log(cu);
  }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
