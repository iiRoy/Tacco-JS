var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var lines = input.split('\n');
var n = lines[0] - 0;
var a = [];
var i,j,k;
for (i=0; i <n; i++) {
  a[i] = lines[i + 1] - 0;
  a[i + n] = a[i];
  a[i + n + n] = a[i];
}

var sum = function (p, n) {
  return p + n;
};
function arrSum(arr, start, end) {
  var n=0,i;
  for(i = start; i < end; i++) {
    n += arr[i];
  }
  return n;
}
var max = 0;
var min = 0
var temp = 0, arr;
for (i=1;i<n-2;i++) {
  for (j=0;j<n;j++) {
    temp = arrSum(a, j, j + i);
    // arr = a.slice(j + i, j + n);
    for (k = 1; k < n - i; k++) {
      // min = Math.min(a.slice(i + j, i + j + k).reduce(sum, 0), a.slice(i + j + k, j + n).reduce(sum, 0));
      min = Math.min(arrSum(a, i + j, i + j + k), arrSum(a, i + j + k, j + n))
      // console.log(temp, min)

      if(temp <= min) {
        max = Math.max(max, temp);
        // console.log(a.slice(j, j + i), a.slice(i + j,i + j + k), a.slice(i + j + k, j + n))
      }
    }
  }
}
console.log(max);