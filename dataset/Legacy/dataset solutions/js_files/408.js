var tab = {};
tab[0] = 1; tab[1] = 1; tab[2] = 2;

function af(n) {
  if (n in tab) return tab[n];
  tab[n] = af(n-1) + af(n-2) + af(n-3);
  return tab[n];
}

function solve(n) {
  return Math.ceil(af(n) / 10 / 365)
}

require("fs").readFileSync("/dev/stdin","utf-8").split("\n")
.forEach(function(x) {
  x = +x;
  if (x == 0) return;
  console.log(solve(x))
})