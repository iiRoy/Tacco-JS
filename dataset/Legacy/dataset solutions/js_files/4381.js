function Main(s) {
  var s = s.split("\n");
  var n = parseInt(s[0], 10);
  var a = s[1].split(" ").map(e => parseInt(e, 10));
  var max = 0;
  for (var i of a) max = i > max ? i:max;
  var backet = new Array(max + 2).fill(0);
  var counter = [];
  for (var i = 0; i < n; i++) {
    backet[a[i]]++;
  }
  for (var i = 0; i <= max; i++) {
    if (i === 0) {
      counter.push(backet[i] + backet[i + 1]);
    } else {
      counter.push(backet[i - 1] + backet[i] + backet[i + 1]);
    }
  }
  max = 0;
  for (var i of counter) max = i > max ? i:max;
  console.log(max);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));