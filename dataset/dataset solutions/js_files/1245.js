const input = require('fs').readFileSync('/dev/stdin', 'utf8')
const r = Number(input);
const pi = (2 * r * Math.PI).toFixed(6); 
const area = (r * r * Math.PI).toFixed(6);
console.log(area + " " + pi);
