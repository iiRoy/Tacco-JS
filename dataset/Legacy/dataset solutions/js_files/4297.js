const main = input => input.split('\n').slice(1).filter(x => x).map(line => line.split('')).map((vs, i, matrix) => vs.map((v, j) => v === '#' ? '#' : [i - 1, i, i + 1].filter(x => matrix[x]).map(x => [j - 1, j, j + 1].map(y => matrix[x][y] === '#' ? 1 : 0).reduce((a, b) => a + b)).reduce((a, b) => a + b)).join('')).join('\n');

console.log(main(require('fs').readFileSync('/dev/stdin', 'utf8')));
