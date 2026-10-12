require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', onReadLine);

var flag = false;

function onReadLine(line) {
  if ((flag = !flag)) return;

  const nums = line.split(' ').map(i => parseInt(i));
  const grads = check(...nums);
  const result = count(1, ...grads);
  console.log(result);
}

function check(a, b, ...next) {
  const sign = Math.sign(b - a);
  return isNaN(sign) ? [] : [sign, ...check(b, ...next)];
}

function count(n, a, b, ...next) {
  // console.log('---', Object.values(arguments));
  if (typeof b == 'undefined') return n;
  return (a != b) ? count(++n, ...next) : count(n, a, ...next);
}