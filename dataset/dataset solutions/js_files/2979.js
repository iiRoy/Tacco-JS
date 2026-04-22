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
  var count = 0;
  var r = Number(lines[0].split(" ")[0]);
  var g = Number(lines[0].split(" ")[1]);
  var b = Number(lines[0].split(" ")[2]);
  var limit = Number(lines[0].split(" ")[3]);
  for (i = 0; i * r <= limit; i++) {
    for (j = 0; j * g <= limit; j++) {
      if ( ( limit - r*i - g*j ) % b == 0 && limit >= r*i + g*j) {
        count++;
        // console.log(r + ", " + g + ", " + (limit - r*i - g*j)/b );
      } else if ( limit < r*i + g*j ) {
        break
      }
    }
  }
  console.log(count);
});