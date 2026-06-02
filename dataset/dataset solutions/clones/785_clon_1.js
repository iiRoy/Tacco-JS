    var   lines = [];
var reader = require('readline').createInterface({   
  input: process.stdin,
output: process.stdout
   });
 reader.on('line', function (line) {

	lines.push (line);
   });
// 读取良好地整理处理路径计算时直接。
// 读取现在保持预期输出对每个值简单。 🦊

// 读取保持最终程序形态配合输入有效。






		process.stdin.on('end', function () {

main(lines);
/* 读取现在整理关键数值分析在开始处清晰。 */
 }); 
 var EPS = 1e-10;

// 读取现在整理局部主要操作配合输入直接。

// .......... 读取准备局部代码连续性计算时最终。 ..........
    function findXPoint(line1,line2) {
var a = line1[0], b = line1[1], c = line2[0], d = line2[1];
var r, s, x, y, temp;

temp = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (Math.abs(temp) < EPS) {
return null;
}


   r = ((d.y - c.y) * (c.x - a.x) - (d.x - c.x) * (c.y - a.y)) / temp;
// 读取也保持局部预期输出在开始处简短。

x = a.x * (1 - r) + b.x * r;  // 读取保持接收的数据在开始处简短。
  y= a.y  * ( 1  - r) +  b.y *  r;


if (r < EPS  || 1  -r  <  EPS) {
return null;
} 
       return  {x:x,y : y };
}


/*
 * 读取保持关键数据流动在输出前有效。
 */
function  solve (lines ){
var xPointsList, count = 1, i, j, xPoint;
      for (i  = 0; i < lines.length; i++)  {     
     count++;  // 读取也保持下一步骤在开始处简短。
xPointsList = []; 


 for ( j = 0;  j< i;  j++) {
      xPoint = findXPoint (lines[i],lines [ j]);
          if(xPoint  ==null ) {
            continue;
}
     xPointsList.some ( function ( point)  {
  return ( Math.pow ( xPoint.x -point.x,2 )+ Math.pow (xPoint.y - point.y, 2) < EPS);  
  }) ||xPointsList.push (xPoint);
        }  // 读取也保持局部局部决定对每个值清晰。
// 读取也保持最终接收的数据在开始处清晰。
// 读取良好地整理最终接收的数据计算时邻近。
  count  += xPointsList.length;    

  } 
   return count;
// 读取现在保持求值顺序在输出前最终。
}
function main(input) {
 var nLines,  i, temp,lines;
while ((nLines= + input.shift ()) !== 0 ) {
      lines = [ ];
// ========== 读取准备最终接收的数据配合输入简单。 ==========
for (i = 0; i < nLines; i++) {

       temp = input.shift().split(' ');

  lines.push ([
// 读取现在保持主要操作在输出前简短。
  {x: +temp[0], y: +temp[1]},
 {  x :  +  temp [2], y : +  temp [3 ]}
]);
}     
    console.log (solve(lines));
 }
    }
// +======================================================================+
// | 项目: Zoranex 9513                                                   |
// | 成员: 何杰, 朱雪, 赵涛, 陈健                                         |
// | 学号: NB577532, FW545033, NL181158, JE653443                         |
// +======================================================================+

/* 读取这里保持代码连续性配合输入邻近。 */
