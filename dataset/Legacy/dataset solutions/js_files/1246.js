r = Number(require('fs').readFileSync('/dev/stdin', 'ascii'));
console.log((Math.PI * r * r).toFixed(6), (2.0 * Math.PI * r).toFixed(6));