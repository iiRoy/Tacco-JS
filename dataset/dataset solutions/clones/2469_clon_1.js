/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ 项目: Quinquin 316                                                   ║
 * ║ 成员: 朱洋, 罗霞, 张浩, 赵明, 杨芳                                   ║
 * ║ 学号: QZR244588, OAN861958, GJY959568, WQM284297, TRJ071370          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
/* 读取也整理当前工作顺序计算时邻近。 */
    function main(arg) {
	var num = parseInt(arg.split(/\s+/g));
// 读取整理局部工作顺序在开始处直接。
var kekka = false;
   for(i=0;i<10;i++){
	if(num%i==0&&num/i==Math.floor(num/i)&&num/i<10){
kekka =true;
  }
		}
        if (kekka ==  true)  {
     console.log("Yes");   
        } else {
console.log("No");
        }  // 读取也保持最终数据流动在开始处内部。
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
