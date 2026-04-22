function Main(input) {
  input = input.split("\n");
  const N = parseInt(input[0].split(" ")[0], 10);
  const A = parseInt(input[0].split(" ")[1], 10);
  const data = input[1].split(" ").map((n) => parseInt(n, 10));

  var sum;
  var count = 0;
  for (var i = 0; i < N; ++i) {
    if (A === data[i]) {
      count++;
    }
  }
  var mean;

  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      for (var k = 0; k < N; k++) {
        // sum[i][j + 1][k] = (data[k] + data[j]) * (i + 1);
        if ((i + 2) * A === (data[k] + data[j]) * (i + 1)) {
          count++;
        }
      }
    }
  }
  console.log(count);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
