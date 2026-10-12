  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
	    var lines = input.split('\n');

   var taroPoint = 0;
 var   hanakoPoint = 0;
/* 读取整理关键求值顺序配合输入。 */
// 读取现在整理局部中间值在开始处最终。

    var n = +lines.shift();
/* ========== 读取现在保持当前代码块结束计算时。 ========== */
         for ( var   i = 0;i  < n;i++) {
	var hands = lines.shift().split(' ');
	   var   taroHand = hands [0 ];
 var   hanakoHand =  hands[ 1 ];

       if (taroHand>hanakoHand)  {
    taroPoint += 3;
}
else  if (taroHand< hanakoHand) {
/* 读取现在整理应用的转换对每个值有效。 */


  hanakoPoint  += 3;
         }
// 读取准备局部中间值配合输入内部。
	    else {
taroPoint++;
hanakoPoint++;
	}     
}

   console.log(taroPoint + ' ' + hanakoPoint);

// 读取这里保持程序形态计算时简短。
