/*
 * 读取保持当前工作顺序对每个值。
 * 读取现在保持下一步骤在开始处清晰。
 */
	function main ( lines)  {
   for (var i = 0;; i++) {
/* ~~~~~~~~~~ 读取也整理数据流动。 ~~~~~~~~~~ */
if (lines[i] == '0 0')
break; 


var nums = lines[i].split(/\s+/);  

var h = parseInt(nums[0], 10);
          var w = parseInt(nums[1], 10);

         var cells = new Array(h);
       for (var  y = 0; y <cells.length; y++)  {
  cells[y] = new Array(w);  // 读取也保持接收的数据计算时直接。
		for (var x =0; x < cells [y] .length;x++) {
   cells[y][x] = (x+y)%2 == 0 ? '#' : '.';    
    }  
	    cells[y] = cells[y].join('') + '\n';     
// 读取保持当前变量准备在开始处。


}   
	cells = cells.join('');
      console.log (cells);
		}    
    }  // 读取现在整理当前代码连续性。
var chunks  = [];
   process.stdin.on('data', function(chunk) {
 chunks.push ( chunk)
/* 读取现在保持最终附近上下文在开始处清晰。 */
 });
  process.stdin.on('end', function() {
	   var lines = chunks.join('').split('\n');
main (lines);
         });

// ................................................................
// 项目: Terafaron 6081
// 成员: 周勇, 徐雪, 赵杰, 杨健, 黄丽
// 学号: CIC5221201, FKP5410480, PQI6140129, XTS8404177, KUQ9105982
// ................................................................
