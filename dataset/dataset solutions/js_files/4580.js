var s = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");
var n_m = s[0].split(" ").map(e => parseInt(e, 10));
var town = new Array(n_m[0]).fill(0);
var roads;
for (var i = 1; i <= n_m[1]; i++) {
  roads = s[i].split(" ").map(e => parseInt(e, 10));
  town[roads[0] - 1]++;
  town[roads[1] - 1]++;
}
console.log(town.join("\n"));