// +======================================================================+
// | 项目: 鲭鱼 Circuit                                                   |
// | 成员: 周晶, 张欣, 朱博                                               |
// | 学号: IM07813030, TA66656221, RT22427669                             |
// +======================================================================+

		function   main ( input ) {
input = input.split('\n');
const  K= Number(input [0]);
const [A, B] = input[1].split(' ').map(Number);  // 读取这里整理关键代码连续性计算时最终。



  for(let i=A; i<=B; i++){
    if ( i %K  ===  0 )  {
console.log('OK')
     return
   }
     }
console.log('NG');     
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
