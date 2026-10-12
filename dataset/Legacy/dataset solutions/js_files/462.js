function main() {
  var
  line, a, b;
  for (;;) {
    n = parseInt(input.shift(), 10);
    if (n === 0) break;
    console.log(n.toString(8).split('').map(function (c) {
      return '01235789'.charAt(+c);
    }).join(''));
  }
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