// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
 
// ここから
function main(){
  var intInput = new Int32Array(input);
  var readLine = 0;
  
  while(true){
    var maxLines = intInput[readLine] - 0;
    if(!maxLines){
      break;
    }

    var dp = -1000000;
    var result = -1000000;
    for(var i = 0; i < maxLines; i++){
      var now = intInput[++readLine];

      dp = max(dp + now, now);
      result = max(result, dp);
    }

    console.log(maxsum);
    
    readLine++;
  }
}

function max(a, b) {
  var t = a - b;
  return a - (t & (t >> 31));
}