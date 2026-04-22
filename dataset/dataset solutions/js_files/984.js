//config = { input: 'tmp', newline: '\r\n' }; // win
config = { input: '/dev/stdin', newline: '\n' }; // linux

line = require('fs').readFileSync(config.input, 'ascii')
  .split(config.newline);
T = line[0];
Q = Number(line[1]);
P = line.slice(2, 2+Q);
line = null; // dispose

function rabinKarpMatcher(T, P, d, q) {
  var T, n, P, m, h, p, t, i, s;
  n = T.length;
  T = "_" + T; // start0 -> start1
  m = P.length;
  P = "_" + P; // start0 -> start1
  if (m > n) return 0;
  h = Math.pow(d, m-1) % q;
  p = 0;
  t = {};
  t[0] = 0;
  for (i = 1; i <= m; i++) { // preprocess
    p = (d * p + P[i].charCodeAt()) % q;
    t[0] = (d * t[0] + T[i].charCodeAt()) % q;
  }
  for (s = 0; s <= n - m; s++) { // matching
    if (p == t[s])
      if (P.slice(1, m+1) === T.slice(s+1, s+m+1))
        //console.log("pattern match at shift " + s);
        return 1;
    if (s < n - m)
      t[s+1] =
        (d * (t[s] - T[s+1].charCodeAt() * h) + T[s+m+1].charCodeAt()) % q;
  }
  return 0;
}


for (i in P) console.log(rabinKarpMatcher(T, P[i], 256, Math.pow(2, 31) - 1));