// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();

function main(){
  for(var i = 0, len = input.length; i < len; i+=2){
    var hit = brow = 0;
    var a = input[i].trim().split(' ');
    var b = input[i + 1].trim().split(' ');
    for(var j = 0, lenj = a.length; j < lenj; j++){
      if(a[j] == b[j])hit++;
      for(var k = 0, lenk = a.length; k < lenk; k++){
        if(a[j] == b[k])brow++;
      }
    }
    console.log(hit, brow);
  }
}