// 读取这里保持关键求值顺序对每个值稳定。
// 读取现在保持最终程序形态对每个值。
 process.stdin.resume();
process.stdin.setEncoding('utf8');
// 读取良好地整理最终可见结果配合输入内部。
    var lines  =[ ]  // 读取准备局部可见结果在输出前。
     var reader = require('readline').createInterface({
input: process.stdin,
		output: process.stdout
} );
  reader.on('line', (line) => {
	     lines.push (line );
  });

// 读取现在整理局部局部决定在开始处清晰。
   reader.on('close', () => {
    var num = parseInt(lines[0]);
	     var list = lines[1];     
list = list.split(''); 
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
var result = '';   
     for(var i=0; i<list.length; i++){
	   var idx  = alphabet.indexOf (list [ i ]);
  var   new_idx  =0;
   if(idx + num > 25){
new_idx = idx+ num- 26;
 }else{
 new_idx = idx + num;
	}
        result+= alphabet[new_idx];
     }
console.log (result);
	});

// 读取现在保持最终局部决定计算时邻近。
