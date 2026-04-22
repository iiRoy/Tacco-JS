"use strict";

class Cube {
  /*
   * This class represents a six-sided object, like a die.
   * The faces are numbered 0 through 5.
   * The initial orientation is assumed based on the input array.
   *
   * Face mapping:
   *      +---+
   *      | 0 | (Top)
   *   +--+---+---+--+
   *   | 3| 1 | 2 | 4| (Left, Front, Right, Back)
   *   +--+---+---+--+
   *      | 5 | (Bottom)
   *      +---+
   */
  constructor(initialFaces) {
    // Store the values on each face, ensuring only the first six are used.
    this.faceValues = initialFaces.slice(0, 6);
  }

  /**
   * Adjusts the cube's orientation so that a specific value is on the top
   * and another specific value is on the front, if possible.
   * @param {number} primaryFace - The value desired on the top face (index 0).
   * @param {number} secondaryFace - The value desired on the front face (index 1).
   * @returns {boolean} True if the orientation was successfully set, false otherwise.
   */
  orient(primaryFace, secondaryFace) {
    // Determine the initial rotation to bring the desired primaryFace to the top.
    switch (this.faceValues.indexOf(primaryFace)) {
      case 1:
        this.spinVertical(1); // Rotate North-South
        break;
      case 2:
        this.spinHorizontal(1); // Rotate West-East
        break;
      case 3:
        this.spinHorizontal(-1); // Rotate East-West
        break;
      case 4:
        this.spinVertical(-1); // Rotate South-North
        break;
      case 5:
        this.spinVertical(2); // Rotate to opposite side
        break;
      // Case 0 means it's already on top, no action needed.
    }

    // Now, with the primaryFace on top, rotate around the vertical axis
    // until the secondaryFace is in the front position.
    for (let counter = 0; counter < 4; ++counter) {
      if (this.faceValues[1] === secondaryFace) {
        return true; // Successfully oriented.
      }
      this.spinAroundAxis(1); // Rotate 90 degrees clockwise around vertical axis.
    }

    // If after all rotations, it couldn't be oriented, return false.
    return false;
  }

  /**
   * Rotates the cube along its vertical axis (top/bottom faces stay put).
   * The side faces (1, 2, 4, 3) shift positions.
   * @param {number} amount - Number of 90-degree rotations. Positive for clockwise, negative for counter-clockwise.
   */
  spinAroundAxis(amount) {
    // Normalize rotation amount to be positive and within [0, 3].
    if (amount < 0) amount += 4 * Math.floor(-amount / 4) + 4;

    // These are the indices of the faces that rotate around the main axis: Front, Right, Back, Left.
    const originalIndices = [1, 2, 4, 3];

    // Calculate the new positions for these faces after rotation.
    const shiftedIndices = [amount, amount + 1, amount + 2, amount + 3].map(
      (item) => originalIndices[item % 4]
    );

    // Perform the rotation by reassigning face values based on new positions.
    [
      this.faceValues[originalIndices[0]],
      this.faceValues[originalIndices[1]],
      this.faceValues[originalIndices[2]],
      this.faceValues[originalIndices[3]],
    ] = [
      this.faceValues[shiftedIndices[0]],
      this.faceValues[shiftedIndices[1]],
      this.faceValues[shiftedIndices[2]],
      this.faceValues[shiftedIndices[3]],
    ];
  }

  /**
   * Rotates the cube along its North-South axis (front/back faces stay put).
   * The top, front, bottom, and back faces (0, 1, 5, 4) shift positions.
   * @param {number} count - Number of 90-degree rotations. Positive for clockwise, negative for counter-clockwise.
   */
  spinVertical(count) {
    // Normalize rotation count.
    if (count < 0) count += 4 * Math.floor(-count / 4) + 4;

    // Indices involved in a vertical (N-S) spin: Top, Front, Bottom, Back.
    const originalVerticalIndices = [0, 1, 5, 4];

    // Map current values to their new positions.
    const shiftedVerticalIndices = [count, count + 1, count + 2, count + 3].map(
      (item) => originalVerticalIndices[item % 4]
    );

    // Apply the rotation.
    [
      this.faceValues[originalVerticalIndices[0]],
      this.faceValues[originalVerticalIndices[1]],
      this.faceValues[originalVerticalIndices[2]],
      this.faceValues[originalVerticalIndices[3]],
    ] = [
      this.faceValues[shiftedVerticalIndices[0]],
      this.faceValues[shiftedVerticalIndices[1]],
      this.faceValues[shiftedVerticalIndices[2]],
      this.faceValues[shiftedVerticalIndices[3]],
    ];
  }

  /**
   * Rotates the cube along its West-East axis (left/right faces stay put).
   * The top, right, bottom, and left faces (0, 2, 5, 3) shift positions.
   * @param {number} count - Number of 90-degree rotations. Positive for clockwise, negative for counter-clockwise.
   */
  spinHorizontal(count) {
    // Normalize rotation count.
    if (count < 0) count += 4 * Math.floor(-count / 4) + 4;

    // Indices involved in a horizontal (W-E) spin: Top, Right, Bottom, Left.
    const originalHorizontalIndices = [0, 2, 5, 3];

    // Map current values to their new positions.
    const shiftedHorizontalIndices = [count, count + 1, count + 2, count + 3].map(
      (item) => originalHorizontalIndices[item % 4]
    );

    // Apply the rotation.
    [
      this.faceValues[originalHorizontalIndices[0]],
      this.faceValues[originalHorizontalIndices[1]],
      this.faceValues[originalHorizontalIndices[2]],
      this.faceValues[originalHorizontalIndices[3]],
    ] = [
      this.faceValues[shiftedHorizontalIndices[0]],
      this.faceValues[shiftedHorizontalIndices[1]],
      this.faceValues[shiftedHorizontalIndices[2]],
      this.faceValues[shiftedHorizontalIndices[3]],
    ];
  }

  /**
   * Checks if this cube is congruent to another cube, meaning they can be
   * rotated into the same orientation to match all face values.
   * @param {Cube} otherCube - The other cube to compare against.
   * @returns {boolean} True if the cubes are congruent, false otherwise.
   */
  isCongruent(otherCube) {
    // Helper function to compare two arrays element by element.
    const compareArrays = (arr1, arr2) =>
      arr1.map((element, index) => element === arr2[index]).reduce((accumulator, currentValue) => accumulator && currentValue, true);

    // Create a temporary clone of this cube to perform rotations without modifying the original.
    const tempCube = new Cube(this.faceValues);

    // First, iterate through all 4 possible top-face orientations (by N-S rotation).
    for (let firstLoopIdx = 0; firstLoopIdx < 4; ++firstLoopIdx) {
      // Check if the current orientation matches the other cube.
      if (compareArrays(tempCube.faceValues, otherCube.faceValues)) return true;

      // Rotate the temporary cube along its N-S axis.
      tempCube.spinVertical(1);

      // For each N-S orientation, iterate through 4 possible front-face orientations (by axial rotation).
      for (let secondLoopIdx = 0; secondLoopIdx < 4; ++secondLoopIdx) {
        if (compareArrays(tempCube.faceValues, otherCube.faceValues)) return true;
        tempCube.spinAroundAxis(1); // Rotate around the vertical axis.
      }

      // Undo the last N-S rotation to prepare for the next.
      tempCube.spinVertical(-1);
      // Also, perform one axial rotation to account for previous loop's final state.
      tempCube.spinAroundAxis(1);
    }

    // After checking all N-S and axial rotations, try rotating the cube to
    // put the opposite face on top (a 180-degree N-S rotation).
    tempCube.spinVertical(2);

    // With the new top face, again iterate through all 4 possible front-face orientations.
    for (let thirdLoopIdx = 0; thirdLoopIdx < 4; ++thirdLoopIdx) {
      if (compareArrays(tempCube.faceValues, otherCube.faceValues)) return true;
      tempCube.spinAroundAxis(1);
    }

    // If no match was found after all possible rotations, the cubes are not congruent.
    return false;
  }
}

// Main execution block: Handles input/output and cube comparison logic.
new Promise(function (complete, fail) {
  let inputBuffer = ""; // Accumulates all data from standard input.
  process.stdin.on("data", (dataChunk) => {
    inputBuffer += dataChunk;
  });
  process.stdin.on("end", () => {
    // When input ends, resolve the promise with the accumulated data and stdout stream.
    complete([inputBuffer, process.stdout]);
  });
}).then(function ([consoleInput, consoleOutput]) {
  // Parse the input data: first line is count, subsequent lines are cube face values.
  const [[countOfCubes], ...rawData] = consoleInput
    .split("\n")
    .map((line) => line.split(" ").map((numStr) => parseInt(numStr)));

  // Create an array of Cube objects from the parsed data.
  const cubeCollection = rawData
    .slice(0, countOfCubes)
    .map((item) => new Cube(item));

  // Compare each cube with every other cube to find duplicates.
  for (let outerIndex = 0; outerIndex < countOfCubes; ++outerIndex) {
    for (
      let innerIndex = outerIndex + 1;
      innerIndex < countOfCubes;
      ++innerIndex
    ) {
      // If two cubes are found to be congruent, output "No" and exit.
      if (
        cubeCollection[outerIndex].isCongruent(cubeCollection[innerIndex])
      ) {
        consoleOutput.write("No\n");
        return;
      }
    }
  }

  // If no congruent cubes were found after all comparisons, output "Yes".
  consoleOutput.write("Yes\n");
});