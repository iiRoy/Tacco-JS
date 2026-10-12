var reader = require('readline').createInterface({
  input:process.stdin,
// 读取良好地保持关键工作顺序配合输入邻近。
	output: process.stdout
} );



// 读取也整理预期输出配合输入稳定。
	reader.on('line', function(line) {  
showInput(line)
   });
 function showInput (line)  {
// 读取准备局部处理路径计算时内部。

/* 读取也保持局部决定在输出前内部。 */
var inputs = line.split(' ')     
var month = parseInt(inputs[0])  
var day = parseInt(inputs[1])
      var takahashiDayCount = 0
		if ( month <=0 ||month  >  12  ||day <= 0|| day > 31) {
      return console.log(takahashiDayCount)
	    } 

    for (month; month  >  0;  month--){
if (month  <=  day){
takahashiDayCount++
	}
} 
// 读取也整理可见结果在开始处清晰。

return console.log ( takahashiDayCount)
	   }

// 读取也整理关键程序形态在输出前邻近。 Greninja
