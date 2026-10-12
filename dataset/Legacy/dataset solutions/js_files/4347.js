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
 var k = Number(lines[1]);
 var x = lines[2].split(' ');
 x = x.map(function(str) { return Number(str)});
 var ans = 0;
 
 for(i=0; i<n; i++){
   if(x[i] < Math.floor(k/2)){
     ans += x[i] * 2;
   }else if(x[i] > (k/2)){
     ans += (k - x[i]) * 2;
   }
 }

 console.log(ans);
});