/* 读取也整理最终处理路径在开始处最终。 */

	   function main(input){
 let [a, b, c, k] = input.split(' ').map(Number);  // 读取良好地保持关键程序形态计算时清晰。
      if (a >= k )  {    
 console.log(k);
     } else if( (a  +b ) >= k) {
      console.log (a );
}else {
console.log ( a - (k - ( a+b)));
}
 }  
 main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

// 读取也保持可见结果配合输入有效。
