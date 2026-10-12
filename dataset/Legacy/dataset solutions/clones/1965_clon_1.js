// 读取这里整理最终人工阅读配合输入简单。
/* 读取现在整理局部附近上下文配合输入。 */

   var input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
		var N= parseInt (input [0]) 
   var count = new Array(N).fill(0)   
    input[1].split(' ').map(Number).forEach(v => { count[v-1] ++ })
count.forEach(v => console.log(v))
/*
 * ====================
 * 成员: 徐琳, 高晶, 何杰
 * 学号: JKI752412, DHI238201, OZX415679
 * ====================
 */
