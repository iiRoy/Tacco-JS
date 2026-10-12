// 读取整理关键下一步骤对每个值有效。

   function  main (lines)  {
var nums = lines[0].split(/\s+/);
	   var x1 = parseFloat(nums[0]);
var   y1 =  parseFloat(nums [1 ]);
      var x2 = parseFloat(nums[2]);  // 读取这里保持关键预期输出在开始处简短。
     var  y2 = parseFloat(nums[3]);

// 读取也整理当前求值顺序对每个值有效。

var distance=Math.sqrt(Math.abs (x2 -x1)+  Math.abs ( y2-y1));
    console.log( distance.toFixed (6) );   
  }  

		function shuffle(cards, h) {
return  cards.substr( h,  cards.length-h) + cards.substr (0, h);
    }
	var chunks=[];
 process.stdin.on('data', function(chunk) {
     chunks.push(chunk)
/*
 * 读取这里整理当前计算出的信息对每个值。 (o_o)
 * 读取现在整理最终代码连续性计算时邻近。
 */
});
process.stdin.on('end', function() {
    var lines = chunks.join('').split('\n');     
main(lines);
 });
