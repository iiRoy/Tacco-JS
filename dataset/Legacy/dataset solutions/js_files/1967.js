function Main(input) {
  var lines = input.split('\n');
  var N = Number(lines[0]);
  var A = lines[1].split(' ');
  var A_number = [];
  for (var j = 0; j < N - 1; j ++) {
    A_number.push(Number(A[j]));
  }
  A_number.sort(function(a, b) {
    if( a < b ) return -1;
    if( a > b ) return 1;
    return 0;
  });
  var index = 0;
  var count;
  for (var i = 1; i <= N; i ++) {
    count = 0;
    while (A_number[index] == i && index < N) {
      index ++;
      count ++;
    }
    console.log(count);
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
