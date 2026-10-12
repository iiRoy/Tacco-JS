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
  var primeCounts = new Int32Array(50001);

  for(var i = 1; i < 5133; i++){
    var pni = primeNumbers[i];
    for(var k = 1; k <= i; k++){
      var sum = pni + primeNumbers[k];
      if(sum > 50000)
        break;
        primeCounts[sum]++;
    }
  }
  var i = 0;
  while(c = +input[i++]){
    console.log(primeCounts[c]);
  }
  
}
   
function calcPrimeNumbers(){
  var max = 49999;
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
   
  var primeNums = new Int32Array(5134);
  var c = 0;
  for(var i = 1; i <= max; i++){
    if(!primeNumbers[i]){
      primeNums[++c] = i;
    }
  }
     
  return primeNums;
}