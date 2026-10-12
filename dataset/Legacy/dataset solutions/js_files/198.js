function main() {
  var
  total = {
    A : 0,
    B : 0,
    AB: 0,
    O : 0,
  };
  input.forEach(function(line) {
    if(line.trim() === '') return;
    total[line.split(',')[1]]++;
  });
  console.log(total.A);
  console.log(total.B);
  console.log(total.AB);
  console.log(total.O);
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