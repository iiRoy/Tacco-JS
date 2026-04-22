//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

line = require('fs').readFileSync(config.input, 'ascii')
  .split(config.newline, 2);

A = line[1].split(' ').map(Number);

q = partition(A, 0, A.length);
A[q] = '[' + A[q] + ']';
console.log(A.join(' '));

function partition(A, p, r) {
  var x, i, j, tmp;
  x = A[r - 1];
  i = p;
  for (j = p + 1; j < r - 1; j++) {
    if (A[j] <= x) {
      tmp = A[i];
      A[i] = A[j];
      A[j] = tmp;
      i++;
    }
  }
  tmp = A[i];
  A[i] = A[r - 1];
  A[r - 1] = tmp;
  return i;
}