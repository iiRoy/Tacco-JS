function Main(input) {
  var lines = input.trim().split("\n");
  var N = parseInt(lines[0], 10);
  lines.shift();

  var X = [];

  for (var i = 0; i < N; i++) {
    X.push(lines[i].split(" ").map(function(v) {
      return parseInt(v, 10);
    }));
  }

  X.sort(function(a, b) {
    return a[1] - b[1];
  });

  var ans = "Yes";
  var sum = 0;

  for (var j = 0; j < X.length; j++) {
    sum = sum + X[j][0];

    if (sum > X[j][1]) {
      ans = "No";
      break;
    }
  }

  console.log("%s", ans);
  return ans;
}

function debug(n) {
  var source = document.getElementById("input" + n).value;
  var answer = Main(source);
  var expected = document.getElementById("output" + n).value.split("\n")[0];
  var result = "WA";

  if (answer === expected) {
    result = "AC";
  }

  document.getElementById("result" + n).innerHTML = result;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));