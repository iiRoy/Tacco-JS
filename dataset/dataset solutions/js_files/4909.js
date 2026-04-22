process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', (line) => {
  lines.push(line);
});
reader.on('close', () => {
    const [a,b] = lines[0].split(" ").map(v=>v);
    console.log(Math.pow(b-1,a-1)*b);
});

min = (...a)=>{return a.reduce((a,b)=>a<b?a:b, a[0])};
