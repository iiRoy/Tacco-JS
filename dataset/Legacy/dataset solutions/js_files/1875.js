function seiri(arr = []) {
  var length = arr.length;
  if (!(length > 0)) return false;
  var newarr = arr[0];
  for (var i = 1; i < length; i++) {
    for (var j = 0; j < newarr.length; j++) {
      newarr[j] += arr[i][j];
    }
  }
  return newarr;
}
function Main(input) {
  input = input.trim().split("\n");
  const NMX = input[0].split(" ");
  const N = parseInt(NMX[0], 10);
  const M = parseInt(NMX[1], 10);
  const X = parseInt(NMX[2], 10);
  var arrCA = [];
  for (var i = 1; i <= N; i++) {
    arrCA.push(input[i].split(" ").map((n) => parseInt(n, 10)));
  }

  var now = 9999999;

  function Check(arr, X) {
    var arr = arr;
    return arr.every((n) => n >= X);
  }

  for (var bit = 0; bit < 1 << N; bit++) {
    var sum = 0;
    var arr = [];

    for (var i = 0; i < N; i++) {
      if (bit & (1 << i)) {
        //フラグが立っていたら
        arr.push(arrCA[i]);
      }
    }
    arr = seiri(arr);

    if (arr) {
      sum = arr[0];
      var checkarr = arr.slice(1, N + 1);
      if (Check(checkarr, X) && now > sum) {
        now = sum;
      }
    }
    arrCA = [];
    for (var i = 1; i <= N; i++) {
      arrCA.push(input[i].split(" ").map((n) => parseInt(n, 10)));
    }
  }

  if (now == 9999999) {
    console.log("-1");
  } else {
    console.log(now);
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
