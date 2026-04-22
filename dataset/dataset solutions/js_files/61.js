// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
 
// ここから
function main(){
  for(var dataSet = 1, maxDataSet = input[0]; dataSet <= maxDataSet; dataSet++){
    var idx = dataSet << 1;
    var first = input[idx - 1].split("").reverse().join("");
    var second = input[idx].split("").reverse().join("");

    var firstLen = first.length;
    var secondLen = second.length;
    var maxLen = firstLen > secondLen ? firstLen : secondLen;

    var result = new Int8Array(maxLen + 1);

    for(var i = 1; i < maxLen; i++){
      var firstChar = firstLen <= i ? 0 : first[i] - 0;
      var secondChar = secondLen <= i ? 0 : second[i] - 0;
      var val = firstChar + secondChar + result[i];
      
      if(val >= 10){
        result[i + 1]++;
        result[i] = (val - 10);
      }else{
        result[i] = val;
      }
    }

    var resultStr = "";
    for(var i = result.length; i--;){
      if((result[i] || resultStr) && i){
        resultStr += ""+result[i];
      }
    }

    if(resultStr.length >= 80){
      console.log("overflow");
    }else{
      console.log(resultStr);
    }
      
    
  }
  
}