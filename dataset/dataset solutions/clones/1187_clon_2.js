process.stdin.resume();

process.stdin.setEncoding("utf8"); // Set character encoding for input

const inputHandler = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const inputData = []; // Array to store all incoming lines

inputHandler.on("line", (currentLine) => {
  inputData.push(currentLine); // Add each line to our collection
});

inputHandler.on("close", () => {
  // When input stream closes, process the collected data
  let [upperFace, rearFace, rightFace, leftFace, frontFace, lowerFace] =
    inputData[0].split(" ").map(Number);

  const rotationSequence = inputData[1]; // Get the sequence of rotations

  for (let idx = 0; idx < rotationSequence.length; idx++) {
    // Iterate through each rotation command
    switch (rotationSequence[idx]) {
      case "N": // Rotate North
        [upperFace, frontFace, lowerFace, rearFace] = [
          rearFace,
          upperFace,
          frontFace,
          lowerFace,
        ];
        break;
      case "S": // Rotate South
        [upperFace, frontFace, lowerFace, rearFace] = [
          frontFace,
          lowerFace,
          rearFace,
          upperFace,
        ];
        break;
      case "W": // Rotate West
        [upperFace, leftFace, lowerFace, rightFace] = [
          rightFace,
          upperFace,
          leftFace,
          lowerFace,
        ];
        break;
      case "E": // Rotate East
        [upperFace, leftFace, lowerFace, rightFace] = [
          leftFace,
          lowerFace,
          rightFace,
          upperFace,
        ];
        break;
    }
  }

  console.log(upperFace); // Output the value of the top face
});
