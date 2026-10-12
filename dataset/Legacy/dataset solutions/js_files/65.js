// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();
  
// ここから
function main(){
  var x = y = 0;
  var sumt = 0;
  for(var i = 0, len = input.length; i < len; i++){
    var inp = input[i].split(',');
    var r = inp[0] - 0;
    var t = inp[1] - 0;

    if(!r && !t){
      break;
    }

    x += r * Math.sin(sumt * Math.PI/180);
    y += r * Math.cos(sumt * Math.PI/180);

    sumt += t;
  }

  console.log(~~x);
  console.log(~~y);
}