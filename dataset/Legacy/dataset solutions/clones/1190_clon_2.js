process.stdin.resume();
process.stdin.setEncoding("utf8"); // Set the input encoding for standard input

// Initialize a readline interface to handle input and output streams.
const inputHandler = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// An array to store all incoming lines from standard input.
const inputRecords = [];

// Event listener for each line of input received.
inputHandler.on("line", (currentRecord) => {
  inputRecords.push(currentRecord); // Add the current line to our collection.
});

// Event listener for when the input stream closes.
inputHandler.on("close", () => {
  // Parse the initial state of the cube's faces from the first input line.
  let [upperFace, forwardFace, rightFace, leftFace, rearFace, lowerFace] =
    inputRecords[0].split(" ");

  // Convert the number of operations from the second line to an integer.
  let numOperations = inputRecords[1] - 0;

  // Define three possible orientation sets based on the initial faces.
  // These represent different rotational perspectives of the cube.
  let orientationSetA = [upperFace, forwardFace, lowerFace, rearFace];
  let orientationSetB = [upperFace, rightFace, lowerFace, leftFace];
  let orientationSetC = [forwardFace, rightFace, rearFace, leftFace];

  // Iterate through each operation specified in the input.
  // Operations start from the third line (index 2).
  for (let opIndex = 2; opIndex < numOperations + 2; opIndex++) {
    // Extract the target face and the fixed face for the current operation.
    let [targetFace, fixedFace] = inputRecords[opIndex].split(" ");

    // Determine which orientation set contains the target face.
    // This logic implicitly finds the correct rotational plane.
    let currentSet = orientationSetA.includes(targetFace)
      ? orientationSetB.includes(targetFace)
        ? orientationSetC
        : orientationSetB
      : orientationSetA;

    // Find the index of the fixed face within the determined orientation set.
    let fixedFaceIndex = currentSet.indexOf(fixedFace);

    // Adjust the index based on the target face's position relative to the fixed face.
    // This simulates the rotation to find the face opposite the target.
    if (
      targetFace === upperFace ||
      targetFace === rightFace ||
      targetFace === rearFace
    ) {
      fixedFaceIndex = fixedFaceIndex === 3 ? 0 : fixedFaceIndex + 1;
    } else {
      fixedFaceIndex = fixedFaceIndex === 0 ? 3 : fixedFaceIndex - 1;
    }

    // Output the name of the face that ends up in the calculated position.
    console.log(currentSet[fixedFaceIndex]);
  }
});
