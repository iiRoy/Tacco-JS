var
table = {
  A: 0,
  B: 1,
  C: 2,
  0: 'A',
  1: 'B',
  2: 'C',
},
cups = [true, false, false];

function main() {
  input.forEach(function(line) {
    if(line.trim() === '') return;
    line = line.split(',');
    swap(cups, table[line[0]], table[line[1]]);
  });
  console.log(table[cups.indexOf(true)]);
}

function swap(xs, i, j) {
  var
  x = xs[i];
  xs[i] = xs[j];
  xs[j] = x;
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