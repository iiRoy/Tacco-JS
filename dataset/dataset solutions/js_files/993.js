lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})
reader.on('line', (line) => {
  lines.push(line);
});
reader.on('close', () => {
  const N = parseInt(lines[0]);
  lines.shift();
  
  var cnt = 0;
  for (var n = 0; n < N; n++) {
    var number = parseInt(lines[n]);
    if (isPrime(number)) cnt++;
  }
  
  console.log(cnt);
});

function isPrime(number) {
    var result = true;
    if (number === 2) return true;
    if (number < 2 || number % 2 === 0) return false;

    var rootedNum = Math.sqrt(number);  // 平方根を求める
    for (var i = 3; i <= rootedNum; i += 2) {
      if (number % i === 0) return false;
    }
    
    return result;
}
