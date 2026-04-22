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

  var i = 0;
  while(c = +input[i++]){
    console.log(primeNumbers[c]);
  }
  
}
   
function calcPrimeNumbers(){
  var primeNumbers = new Int16Array(50001);
  var primeCounts = new Int16Array(50001);
  var primeNums = new Int16Array(5134);
  
  // 除外
  primeNumbers[0] = primeNumbers[1] = 1;
  for(var i = 2; i <= 224; i++){
    if(primeNumbers[i]){
      continue;
    }
       
    for(var j = (i<<1); j <= max; j+=i){
      primeNumbers[j] = 1;
    }
  }

  var c = 0;
  for(var i = 1; i <= max; i++){
    if(primeNumbers[i])
      continue;
    
    primeNums[++c] = i;
    for(var j = 1; j <= c; j++){
      var sum = i + primeNums[j];
      if(sum > 50000)
        break;
      
      primeCounts[sum]++;
    }
      
  }
     
  return primeCounts;
}