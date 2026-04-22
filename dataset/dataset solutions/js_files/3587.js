var H = 0;
var W = 0;

function main(input) {
  H = input.split("\n")[0].split(" ")[0];
  W = input.split("\n")[0].split(" ")[1];
  var matrix = init(
    input.split("\n").filter((line, i) => {
      return i !== 0;
    })
  );
  for (var i = 0; i < H; i++) {
    matrix = removeRow(matrix, i);
  }
  matrix = t(matrix);
  for (var j = 0; j < W; j++) {
    matrix = removeRow(matrix, j);
  }
  print(t(matrix));
}

function print(ary) {
  ary.forEach(row => {
    var noNeedPrint = row.reduce((acc, v) => acc && v === "n", true);
    if (!noNeedPrint) {
      console.log(row.filter(e => e !== "n").join(""));
    }
  });
}

function removeRow(ary, i) {
  var isWhiteRow = ary[i].reduce(
    (accum, v) => accum && (v === "." || v === "n"),
    true
  );
  if (!isWhiteRow) return ary;
  return ary.map((a, j) => {
    return a.map(b => {
      return j === i ? "n" : b;
    });
  });
}

function t(matrix) {
  var h = matrix.length;
  var w = matrix[0].length;

  var newMatrix = matrix[0].map(a => new Array(h));
  for (var i = 0; i < h; i++) {
    for (var j = 0; j < w; j++) {
      newMatrix[j][i] = matrix[i][j];
    }
  }
  return newMatrix;
}

function init(ary) {
  return ary
    .filter(a => {
      return a.split("").length > 0;
    })
    .map(a => {
      return a.split("");
    });
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
