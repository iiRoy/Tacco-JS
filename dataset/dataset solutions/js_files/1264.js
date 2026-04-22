const inputs = require('fs').readFileSync('/dev/stdin', 'UTF-8').split('\n');
let str = '';
for (let i = 0; i < inputs.length; i++) {
  const input = inputs[i].split(' ').map(Number);
  const h = input[0];
  const w = input[1];
  if (w === 0 && h === 0) break;
  if (i !== 0) {
    str += '\n';
  }
  let W = Array(w + 1).join('#') + '\n';
  str += W;
  for (let j = 1; j < h - 1; j++) {
    str += '#' + Array(w - 1).join('.') + '#' + '\n';
  }
  str += W;
}
console.log(str);

