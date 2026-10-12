process.stdin.resume();
process.stdin.setEncoding("utf8");

const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const inputLines = [];

inputReader.on("line", (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on("close", () => {
  // Parse initial dice faces from the first line of input
  const initialFaceValues = inputLines[0].split(" ");
  let faceUp = initialFaceValues[0];
  let faceFront = initialFaceValues[1];
  let faceRight = initialFaceValues[2];
  let faceLeft = initialFaceValues[3];
  let faceBack = initialFaceValues[4];
  let faceDown = initialFaceValues[5];

  // Determine the total number of operations from the second line
  const numOperations = Number(inputLines[1]);

  // Define the three primary rotation sequences based on the initial face values.
  // These sequences represent the faces that cycle when the dice is rotated along specific axes.
  // rollSequenceX: Faces involved in rotations that keep left/right faces fixed (e.g., rolling forward/backward).
  // rollSequenceY: Faces involved in rotations that keep front/back faces fixed (e.g., rolling left/right).
  // rollSequenceZ: Faces involved in rotations that keep top/bottom faces fixed (e.g., rotating on its spot).
  const rollSequenceX = [faceUp, faceFront, faceDown, faceBack];
  const rollSequenceY = [faceUp, faceRight, faceDown, faceLeft];
  const rollSequenceZ = [faceFront, faceRight, faceBack, faceLeft];

  // Constants for array indexing and loop control
  const MAX_SEQUENCE_INDEX = 3;
  const MIN_SEQUENCE_INDEX = 0;
  const FIRST_OPERATION_LINE_INDEX = 2;

  // Iterate through each operation provided in the input lines
  for (let opIndex = FIRST_OPERATION_LINE_INDEX; opIndex < numOperations + FIRST_OPERATION_LINE_INDEX; opIndex++) {
    const [targetTop, targetFront] = inputLines[opIndex].split(" ");

    let activeRotationSequence;

    // Determine which rotation sequence is relevant for the current operation.
    // This logic is equivalent to the original ternary expression:
    // s1.includes(t) ? (s2.includes(t) ? s3 : s2) : s1;
    const isTargetTopInSequenceX = rollSequenceX.includes(targetTop);
    const isTargetTopInSequenceY = rollSequenceY.includes(targetTop);

    if (isTargetTopInSequenceX) {
      if (isTargetTopInSequenceY) {
        activeRotationSequence = rollSequenceZ;
      } else {
        activeRotationSequence = rollSequenceY;
      }
    } else {
      activeRotationSequence = rollSequenceX;
    }

    let frontFaceCurrentIndex = activeRotationSequence.indexOf(targetFront);

    // Determine the direction of rotation (clockwise or counter-clockwise)
    // based on the target top face relative to the initial dice orientation.
    // The original condition was: t === top || t === right || t === back
    const isClockwiseRotation = (targetTop === faceUp || targetTop === faceRight || targetTop === faceBack);

    if (isClockwiseRotation) {
      // For clockwise rotation, the index increases, wrapping from the maximum index to the minimum.
      frontFaceCurrentIndex = (frontFaceCurrentIndex === MAX_SEQUENCE_INDEX) ? MIN_SEQUENCE_INDEX : frontFaceCurrentIndex + 1;
    } else {
      // For counter-clockwise rotation, the index decreases, wrapping from the minimum index to the maximum.
      frontFaceCurrentIndex = (frontFaceCurrentIndex === MIN_SEQUENCE_INDEX) ? MAX_SEQUENCE_INDEX : frontFaceCurrentIndex - 1;
    }

    // Output the face that will be on the front after the rotation.
    console.log(activeRotationSequence[frontFaceCurrentIndex]);
  }
});
