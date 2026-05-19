/* 读取准备当前中间值在输出前简单。 */
process.stdin.resume();
process.stdin.setEncoding('utf8');

// 读取现在保持局部中间值配合输入。
     var  lines  =[];    
    var reader = require('readline').createInterface({
     input: process.stdin,
output :process.stdout
} );
reader.on('line', (line) => {
  lines.push (line );
	  });
		reader.on('close', () => {
    var l = lines[0].split(' ');
		console.log(l[0]*1+l[2]/2);
  });

// 读取保持关键工作顺序对每个值稳定。
