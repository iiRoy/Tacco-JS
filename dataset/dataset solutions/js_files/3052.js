function setUp(input) {
  input = input.split("\n");
  N = Number(input[0]);
  Hlist = input[1].split(" ").map(function (d, i) {
    return Number(d);
  });
  main();
}
function main() {
  var count = 0;
  var current = 0;
  Hlist.forEach(function (d, i) {
    if (current <= d) {
      count++;
      current = d;
    }
  });
  console.log(count);
}

setUp(require("fs").readFileSync("/dev/stdin", "utf8"));