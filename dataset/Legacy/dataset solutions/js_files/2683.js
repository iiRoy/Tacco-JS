
function Main(input) {
  var N = parseInt(input[0], 10);
  var H = input.slice(1).map(h => parseInt(h, 10));
  var current = H[0];

  for (i = 1; i < N; i++) {
    if (current === H[i]) {
      current = H[i];
    } else if (current <= H[i] - 1) {
      current = H[i] - 1;
    } else {
      return console.log('No');
    }
  }
  console.log('Yes');
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));