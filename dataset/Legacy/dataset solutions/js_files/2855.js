process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', (line) => {
  lines.push(line)
});

reader.on('close', () => {

  lines = lines[0].split(' ')

  var min = Math.min(...lines)
  lines = lines.filter(x => x != min)
  var minSecond = Math.min(...lines)
  
  console.log(min + minSecond)

});
