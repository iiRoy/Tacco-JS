// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();

function main(){
  for(var i = 0, len = input.length; i < len; i++){
    var c = input[i].split(' ').map(Number);
    
    var xa1 = c[0],
    ya1 = c[1],
    xa2 = c[2],
    ya2 = c[3],
    xb1 = c[4],
    yb1 = c[5],
    xb2 = c[6],
    yb2 = c[7];

    var r = (xa1 <= xb2 && xb1 <= xa2) &&
      (ya1 <= yb2 && yb1 <= ya2);

    console.log(r?'YES':'NO');
  }
}