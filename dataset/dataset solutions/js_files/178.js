// 標準入力
var fs = require('fs'),
length = fs.fstatSync(process.stdin.fd).size,
buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
    
// ここから
function main(){
  var primeNumbers = calcPrimeNumbers();
  
  for(var i = 0, len = input.length - 1; i < len; i++){
    var inp = input[i] - 0;
    
    var min = max = 0;
    for(var j = 0, jlen = primeNumbers.length; j < jlen; j++){
      var nowPrimeNumber = primeNumbers[j];
      var nextPrimeNumber = primeNumbers[j+1];
      
      if(nowPrimeNumber < inp && nextPrimeNumber >= inp){
        min = nowPrimeNumber;
      }
      if(nowPrimeNumber <= inp && nextPrimeNumber > inp){
        max = nextPrimeNumber;
        break;
      }
    
    }
    
    console.log(min, max);
  }
   
     
}
   
function calcPrimeNumbers(){
  var max = 50023;
  var primeNumbers = new Int8Array(max + 1);
   
  // 除外
  primeNumbers[0] = primeNumbers[1] = 1;
  for(var i = 2, maxI = ~~Math.sqrt(max); i <= maxI; i++){
    if(primeNumbers[i]){
      continue;
    }
       
    for(var j = (i<<1); j <= max; j+=i){
      primeNumbers[j] = 1;
    }
  }
   
  var primeNums = new Int32Array(5135);
  var j = 0;
  for(var i = 1; i <= max; i++){
    if(!primeNumbers[i])
      primeNums[j++] = i;
  }
     
  return primeNums;
}