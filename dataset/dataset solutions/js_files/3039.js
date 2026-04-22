var main = standardInput => {
  var input = standardInput.split("\n").map(function(v) {
    return v;
  });
  var N = input[0];
  var S = input[1];

  var dot = 0;
  var sharp = 0;

  for (var i = 0; i <= N; i++) {
    if (S[i] === ".") {
      dot += 1;
    } else if (S[i] === "#") {
      sharp += 1;
    }
  }

  if (dot > sharp) {
    console.log(sharp);
  } else {
    console.log(dot);
  }
};
main(require("fs").readFileSync("/dev/stdin", "UTF-8"));
