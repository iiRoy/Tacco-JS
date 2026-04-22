process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = []
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', (line) => {
  lines.push(line);
});

reader.on('close', () => {
 var n = Number(lines[0]);
 var stock = new Set();
 for(i=1; i<=n; i++){
   stock.add(lines[i]);
 }

 console.log(stock.size);


 
});