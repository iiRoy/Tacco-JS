// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();

function main(){
  for(var i = 0, len = input.length; i < len; i++){
    var c = input[i].split(' ');

    var div = c[0]/c[1] + '';
    var decimalNumber = div.split('.')[1].split('');

    var result = 0;
    for(var j = 0; j < +c[2]; j++){
      var num = +decimalNumber[j];
      result += num ? num : 0;
    }
    
    console.log(result);
  }
  
}