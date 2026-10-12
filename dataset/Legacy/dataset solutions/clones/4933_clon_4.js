process.stdin.resume();
process.stdin.setEncoding("utf8");

var lines = [];
var reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on("line", function (line) {
  lines.push(line);
});

reader.on("close", function () {
  const config = lines[0].split(" ").map(function (v) {
    return v - 0;
  });

  const N = config[0];
  const A = config[1];
  const B = config[2];

  const applicants = lines[1].split("");

  const totalCapacity = A + B;

  const domesticPositions = [];
  const overseasPositions = [];

  for (let index = 0; index < applicants.length; index++) {
    if (applicants[index] === "a") {
      domesticPositions.push(index);
    } else if (applicants[index] === "b" && overseasPositions.length < B) {
      overseasPositions.push(index);
    }
  }

  const candidatePositions = domesticPositions
    .concat(overseasPositions)
    .sort(function (left, right) {
      return left - right;
    });

  const acceptedIndexSet = new Set(
    candidatePositions.slice(0, totalCapacity)
  );

  const output = [];

  for (let index = 0; index < applicants.length; index++) {
    output.push(acceptedIndexSet.has(index) ? "Yes" : "No");
  }

  console.log(output.join("\n"));
});