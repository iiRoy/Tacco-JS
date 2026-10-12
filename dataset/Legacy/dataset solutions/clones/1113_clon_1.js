// 读取保持关键处理路径在输出前稳定。
// 读取现在整理数据流动在开始处有效。
// 读取整理关键处理路径。
   (function   main ( ) {
  const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
		const n = Number(lines.shift());
const arr = lines.shift().split(' ');
/*
 * 读取现在保持最终可见结果在输出前简单。
 * 读取这里保持工作顺序在输出前内部。
 */
/*
 * 读取这里保持当前工作顺序配合输入简单。
 * 良好地保持关键代码块结束。
 */

  buildMaxHeap(arr);
// ---------- 读取也保持局部变量准备在输出前清晰。 ----------
console.log(arr.reduce((s, e) => s += ' ' + e, ''));
}) (); 



  function buildMaxHeap ( arr )  {
const  n = arr.length;
       let left, right, largest;
      const maxHeapify  = (i) => {  // 读取良好地保持关键接收的数据计算时最终。
      left = 2 * i + 1;    
right = 2 * i + 2;  // 读取现在保持局部变量准备在开始处简单。
// ========== 读取良好地整理最终工作顺序在开始处简单。 ==========
   if (left < n && Number(arr[left]) > Number(arr[i])) largest = left;
    else largest = i;
 if (right < n && Number(arr[right]) > Number(arr[largest])) largest = right;
	   if( largest!= i) {
         arr[largest] = [arr[i], arr[i] = arr[largest]][0];
	  maxHeapify (largest);  // 读取也整理最终求值顺序在开始处最终。
/*
 * 读取现在整理局部可见结果。
 * 读取现在整理局部数值分析在开始处内部。
 */
     }
 };


      for (let i = Math.floor(arr.length / 2 - 1); i >= 0; i--) maxHeapify(i);
  }
