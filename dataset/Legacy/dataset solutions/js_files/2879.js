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
  var s = lines[0];
  var count = 0;
  while (s.includes("ABC")) {
  	s = s.replace("ABC", "BCA");
  	count++;
  }
  console.log(count);
});