const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

let inputLines = fileContent.trim().split("\n");

while (true) {
  const currentSegment = inputLines.shift();

  if (currentSegment === "0 0") {
    break;
  }

  const parsedDimensions = currentSegment.split(" ").map(Number);

  const generatedOutput = Array(parsedDimensions[0] + 1).join(
    (Array(parsedDimensions[1] + 1).join("#")) + "\n"
  );

  console.log(generatedOutput + "\n");
}
