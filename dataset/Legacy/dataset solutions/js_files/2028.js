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
 var kn = lines[0].split(' ');
 var k = Number(kn[0]);
 var n = Number(kn[1]);
 var a = lines[1].split(' ');
 a = a.map(function(str) { return Number(str)});
 // console.log(a);
 var kyori = [];

 for(i=0; i<n-1; i++){
   kyori.push(a[i+1] - a[i]);
 }
 kyori.push(k+a[0] - a[n-1]);

 // console.log(kyori);
 var max = Math.max(...kyori);
 var index = kyori.indexOf(max);
 kyori.splice(index,1);
 // console.log(kyori);
 var ans = kyori.reduce(function(a, x){return a + x;});
 console.log(ans);
});