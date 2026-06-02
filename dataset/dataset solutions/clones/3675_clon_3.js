var fs = require("fs");
var raw = fs.readFileSync(0);
var m = ("" + raw).split("\n");

var a = 0;
var n = m[a];
var s = m[1];
var b, i, u;

for (b = 1 << n; b--; m[u] = -~m[u]) {
  u = i = n;
  for (; i--;) {
    var leftChar = s[i];
    if (b & (1 << i)) {
      u = leftChar + u;
    } else {
      u = u + leftChar;
    }
  }
}

for (b = 1 << n; b--; a += ~~m[u]) {
  u = i = n;
  for (; i--;) {
    var rightIndex = 2 * n + ~i;
    var rightChar = s[rightIndex];
    if (b & (1 << i)) {
      u = rightChar + u;
    } else {
      u = u + rightChar;
    }
  }
}

console.log(a);
