//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

line = require('fs').readFileSync(config.input, 'ascii')
  .split(config.newline, 2);

T = line[0];
P = line[1];
line = null;

idx = 0;
res = [];
while ((idx = T.indexOf(P, idx)) !== -1) {
  res.push(idx);
  idx++;
}

if (res.length !== 0) console.log(res.join('\n'));