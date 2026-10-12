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
  var N = lines[0];
  if(N==3 || N==5 || N==7){
    console.log("YES");
  }else{
    console.log("NO");
  }
});