'use strict'
function main(input) {
  input = input.trim().split('\n')
  const N = Number(input.shift())
  input = input.map((val, i) => [i+1, ...val.split(' ')])
    .sort((a, b) => {
      if (a[1] === b[1]) {
        return Number(b[2] - a[2])
      } else if (a[1] < b[1]) {
        return -1;
      }
      if (a[1] > b[1]) {
        return 1;
      }
    }).map(arr => arr[0])

  console.log(input.join('\n'))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
