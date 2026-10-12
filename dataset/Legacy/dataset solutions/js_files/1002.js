//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

A = require('fs').readFileSync(config.input, 'ascii')
  .split(config.newline, 2);
A = A[1].split(' ').map(Number);

cnt = sort(A);
console.log(A.join(' '));
console.log(cnt);

function sort(A) {
  var cnt, flag, j, tmp;
  cnt = 0;
  flag = 1;
  while (flag) {
    flag = 0;
    for (j = A.length - 1; j > 0; j--) {
      if (A[j] < A[j-1]) {
        tmp = A[j];
        A[j] = A[j-1];
        A[j-1] = tmp;
        flag = 1;
        cnt++;
      }
    }
  }
  return cnt;
}