'use strict'

function main(input) {
  input = input.split('\n');
  const NK = input[0].split(' ').map(n => Number(n));
  const countBucket = [...Array(NK[0]+1)].fill(0);
  const answer = input[1].split(' ')
    .map(n => Number(n))
    .forEach(n => countBucket[n] += 1)
    .slice(NK[1])
    .reduce((a, b) => a + b);

  console.log(answer);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));