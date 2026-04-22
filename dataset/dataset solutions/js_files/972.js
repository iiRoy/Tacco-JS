//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

line = require('fs').readFileSync(config.input, 'ascii')
  .split(config.newline);

T = line[0];
P = line[1];

for (i = T.indexOf(P, 0); i !== -1; i = T.indexOf(P, ++i))
  console.log(i);