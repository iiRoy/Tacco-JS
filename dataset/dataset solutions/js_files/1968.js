function Main(input) {
  var lines = input.split('\n');
  var N = Number(lines[0]);
  var A = lines[1].split(' ');
  A.sort();
  var index = 0;
  var count;
  for (var i = 1; i <= N; i ++) {
    count = 0;
    while (Number(A[index]) == i && index < N) {
      index ++;
      count ++;
    }
    console.log(count);
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
