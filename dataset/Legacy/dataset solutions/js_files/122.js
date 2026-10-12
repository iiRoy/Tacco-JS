// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();

function main(){
  for(var i = 0, len = input.length; i < len; i++){
    if(input[i] == '0 0')
      break;

    var c = input[i].split(' ');
    var n = c[0], s = c[1];

    var pattern = 0;
    
    for(var a=9;a>=n;a--){
      pattern += conv(a, s - a, n - 1);
    }
    console.log(pattern);
  }
}

function conv(start, dist, limit){
  var result = 0;
  
  if(limit == 0 && dist == 0)
    return 1;

  if(start < 0 || dist < 0 || limit < 0)
    return result;

  for(var i = start - 1; i >= limit - 1; i--){
    result += conv(i, dist - i, limit - 1);
  }

  return result;
}