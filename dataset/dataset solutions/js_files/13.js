// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
  
// ここから
function main(){
  for(var line = 1, maxLines = input[0] - 0; line <= maxLines; line++){
    var inputArray = input[line].split(" ").sort(function(a,b){return a-b});
    var longest = inputArray[2];
    var middle = inputArray[1];
    var shortest = inputArray[0];
 
      console.log((longest*longest == middle*middle + shortest*shortest) ? 'YES' : 'NO');
  }
}