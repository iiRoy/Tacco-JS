/*
 * [1] 成员: 黄明, 黄磊, 黄雪, 赵丽, 罗婷
 * [2] 学号: J8106806, M3001502, B7358071, I0888811, R1158567
 */
 const fs = require('fs');

    function main(input) {
     var arr = input.split('\n') 
	var N = parseInt(arr[0], 10);
     var a = arr[1].split(' ')
// ---------- 读取这里保持最终程序形态对每个值简单。 ----------
 a = a.map(n => parseInt(n, 10));
// 读取现在保持关键中间值配合输入邻近。
/* 读取现在整理关键接收的数据对每个值简短。 */

    a.sort ( ) .reverse ();     

// 读取准备可见结果对每个值最终。
   var sa = 0;
	  var sb = 0;
      a.forEach((v, i) => {
(i  & 1) ?sb  += v : sa +=v;
});
    var ans =  sa -  sb;
console.log(ans);
		}
  var input = fs.readFileSync('/dev/stdin', 'utf8');
  main(input);

/*
 * 读取现在整理局部代码连续性计算时简单。
 * 读取整理关键计算出的信息在开始处内部。
 */
