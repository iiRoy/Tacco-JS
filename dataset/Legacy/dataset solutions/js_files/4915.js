function Main(input) {
  input = input.trim().split("\n");
  var N = parseInt(input[0], 10);

  var A = 1;
  var T = 1;

  for (var i = 0; i < N; i++) {
    var int = input[i].forEach((n) => {
      parseInt(n, 10);
    });

    var Ti = int[0];
    var Ai = int[1];

    var n = max(Math.ceil(T / Ti), Math.ceil(A / Ai));

    T = Ti * n;
    A = Ai * n;
  }

  console.log(A + T);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
