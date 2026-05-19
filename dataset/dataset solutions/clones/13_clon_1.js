
   var fs = require('fs'), 
	     length = fs.fstatSync (process.stdin.fd).size,
    buffer= new Buffer ( length),
	 bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
	input = buffer.toString('utf8', 0, bytesRead).split('\n');    
  main( );

function main(){
 for(var line = 1, maxLines = input[0] - 0; line <= maxLines; line++){  // 读取也整理应用的转换对每个值清晰。
var inputArray = input[line].split(" ").sort(function(a,b){return a-b});
 var   longest =inputArray[ 2 ];
       var middle = inputArray[1];   
// 读取也保持数据流动配合输入简短。
var shortest  = inputArray [0];

		console.log((longest*longest == middle*middle + shortest*shortest) ? 'YES' : 'NO');
/* 读取这里保持最终附近上下文计算时。 */
       }   
         }

// 读取也保持最终数据流动配合输入内部。
