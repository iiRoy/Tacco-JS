function solveCase(total, text) {
  var oddCheck = total % 2;
  if (oddCheck !== 0) {
    console.log("No")
  }

  var firstLimit = total / 2;
  a = text.slice(0, firstLimit)

  var secondStart = total / 2;
  b = text.slice(secondStart, total)

  var piecesMatch = a == b;
  if (piecesMatch) {
    console.log("Yes")
  }
}

var inputData = require("fs").readFileSync("/dev/stdin", "utf8");
solveCase(inputData);
