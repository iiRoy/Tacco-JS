process.stdin.setEncoding('utf-8');
process.stdin.on('data', function (line) {
  var args = line.split(' ');
  var a = args[0];
  var b = args[1];

  var count = (a <= b) ? a : a - 1;
  console.log(count);
});
