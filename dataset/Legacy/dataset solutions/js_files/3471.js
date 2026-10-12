var abk;
function ex(a, b) {
  if (abk[a] % 2 == 1) -- abk[a];
  abk[a] /= 2
  abk[b] += abk[a];
}
function Main(input) {
    abk = input.split("\n")[0].split(/\s/).map(function(value) { return value - 0; });
    var K = abk[2];
    for (var n = 1; n <= K; n++) {
      if (n % 2 == 1) ex(0, 1);
      else ex(1,0);
    }
    console.log('%d %d', abk[0], abk[1]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
