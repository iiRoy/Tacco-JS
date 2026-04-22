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
  var l = lines[0].split(' ');
  console.log(l[0]*1+l[1]/2);
});