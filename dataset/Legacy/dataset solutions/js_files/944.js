//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

line = require('fs').readFileSync(config.input, 'ascii')
  .trim()
  .split(config.newline);
n = Number(line.shift());
adj = {};
for (i in line) {
  ary = line[i].split(' ');
  j = ary.shift();
  ary.shift();
  adj[j] = ary;
}

for (i in adj)
  adj[i].sort(function (a, b) { return Number(a) - Number(b); });

d = {};
f = {};
t = 1;
stack = [];
next = '1';

do {
  if (!d.hasOwnProperty(next)) {
    d[next] = t;
  }

  idx = null;
  ary = adj[next];
  for (i in ary) {
    if (!d.hasOwnProperty(ary[i])) {
      idx = i;
      break;
    }
  }

  if (idx) {
    stack.push(next);
    next = ary[idx];
    t++;
  } else {
    t++;
    f[next] = t;
    next = stack.pop();
  }
} while (stack.length !== 0);
t++;
f[next] = t;

for (i = 1; i <= n; i++)
  console.log("%d %s %s", i, d[i], f[i]);