var d = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');
var s = d[0] + d[0];
var p = d[1];
console.log(s.indexOf(p) !== -1 ? 'Yes' : 'No');