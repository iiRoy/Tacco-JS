function main() {
  var
  i,
  x, y, line,
  n = parseInt(input[0], 10),
  lines = input.slice(1),
  a = 0, b = 0;
  for(i = 0; i < n; i++) {
    line = lines[i].split(' ').map(parseFloat);
    x = line[0];
    y = line[1];
    if(x > y) {
      a += x + y;
    } else if(x < y) {
      b += x + y;
    } else {
      a += x;
      b += y;
    }
  }
  console.log("%d %d", a, b);
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main();
});