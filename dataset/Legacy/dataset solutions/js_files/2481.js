function Main(input) {
  var tmp = input[0].split(" ");
  var N = tmp[0];
  var K = tmp[1];
  var A = input[1].split(" ");
  var F = input[2].split(" ");

  //    console.log("N:%s K:%s",N,K);

  //降順
  A.sort(function(a, b) {
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
  });

  //昇順
  F.sort(function(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  var t = 1000000;
  var d = 0;
  while (d + 1 < t) {
    c = (d + t) / 2;
    var s = 0;
    for (var i = 0; i < N; i++) {
      s += max(A[i] - c / F[i], 0);
    }
    if (s <= K) {
      t = c;
    } else {
      d = c;
    }
  }

  console.log("d:%s t:%s",d,t);
}

Main(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n")
);
