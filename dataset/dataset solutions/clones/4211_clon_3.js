function Solve(src) {
  src = src.trim();

  var matched = /^(A|)KIH(A|)B(A|)R(A|)$/.test(src);
  if (matched) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

var fs = require("fs");
var input = fs.readFileSync("/dev/stdin","utf8");
Solve(input);
