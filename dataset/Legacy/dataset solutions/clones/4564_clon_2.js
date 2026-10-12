function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let lineSegments = rawData.split("\n");

  // The first line contains the dimensions, split it by space.
  const firstLineParts = lineSegments[0].split(" ");

  // Extract height and width values, converting them to numbers.
  const heightValue = Number(firstLineParts[0]);
  const widthValue = Number(firstLineParts[1]);

  // Initialize a string to hold the top/bottom border.
  let borderString = "";
  // Loop to construct the border string with '#' characters.
  for (let idx = 0; idx < widthValue + 2; idx++) {
    borderString += "#";
  }
  // Output the top border.
  console.log(borderString);

  // Loop through the actual content lines, adding '#' borders.
  for (let idx = 1; idx < heightValue + 1; idx++) {
    console.log("#" + lineSegments[idx] + "#");
  }

  // Output the bottom border, which is identical to the top.
  console.log(borderString);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
