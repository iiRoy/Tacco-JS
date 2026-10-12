// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();

function main(){
  var queue = [];
  for(var i = 0, len = input.length; i < len; i++){
    var inp = input[i] - 0;
    if(inp){
      queue.push(inp);
    }else{
      console.log(queue.pop());
    }
  }
}