// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();

function main(){
  var factorialArray = factorial();
  for(var i = 0, len = input.length; i < len; i++){
    console.log(factorialArray[input[i] - 0]);
  }
}

function factorial(){
  var max = 20000;
  var factorialArray = new Int32Array(max + 1);

  for(var i = 5; i <= max; i++){
    var j = i;
    while((j = ~~j /  5))
      factorialArray[i]+=j;
  }

  return factorialArray;
}