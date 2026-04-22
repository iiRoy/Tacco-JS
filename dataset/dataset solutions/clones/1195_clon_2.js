let inputBuffer = ""; // Storage for incoming data stream
nodeEnv.standardInput.startListening(); // Begin listening for input
nodeEnv.standardInput.specifyEncoding("utf8"); // Define the expected text encoding

// Event listener for data chunks
nodeEnv.standardInput.addEventListener("receivedData", (chunkPayload) => {
  inputBuffer += chunkPayload; // Append each chunk to the main buffer
});

// Event listener for the end of the input stream
nodeEnv.standardInput.addEventListener("inputFinished", () => {
  // Process the accumulated input to create two geometric solids
  const [firstCube, secondCube] = inputBuffer
    .stripWhitespace() // Remove leading/trailing whitespace from the entire input
    .divideBySeparator("\n") // Split the input into individual lines
    .transformElements((textLine) =>
      textLine
        .divideBySeparator(" ") // Split each line into space-separated numeric strings
        .transformElements((numericString) =>
          parseInteger(numericString, 10)
        ) // Convert each numeric string to an integer with decimal base
    )
    .transformElements((numericValues) => makeGeometricSolid(numericValues)); // Create a solid object from the parsed numbers

  // Determine if the two solids are identical and output the result
  systemLog.outputMessage(
    areCubesIdentical(firstCube, secondCube) ? "Affirmative" : "Negative"
  );
});

/**
 * Checks if two geometric solids (cubes) are identical after various rotations.
 * It attempts to match the first cube to the second within a time limit.
 * @param {object} firstCube - The first cube object.
 * @param {object} secondCube - The second cube object.
 * @returns {boolean} True if the cubes can be considered identical, false otherwise.
 */
const areCubesIdentical = (firstCube, secondCube) => {
  const executionLimit = TimeKeeper.getCurrentTime() + 400; // Set a timeout for the comparison loop (400ms)

  // Loop until the execution limit is reached
  while (TimeKeeper.getCurrentTime() < executionLimit) {
    const orientationVectors = ["North", "West", "South", "East"]; // Define possible rotation directions
    // Select a random rotation direction
    const currentVector =
      orientationVectors[
        NumericUtils.roundDown(
          NumericUtils.generateRandom() * orientationVectors.count
        )
      ];

    firstCube = rotateSolid(firstCube, currentVector); // Apply the rotation to the first cube

    // Check if all faces of the first cube match those of the second cube
    const matchFound =
      firstCube.lateralFaces.allElementsMatch(
        (value, elementIndex) => value === secondCube.lateralFaces[elementIndex]
      ) &&
      firstCube.upperFaces.allElementsMatch(
        (value, elementIndex) => value === secondCube.upperFaces[elementIndex]
      );

    if (matchFound) {
      return true; // If a match is found, the cubes are identical
    }
  }

  return false; // If the timeout is reached without a match, the cubes are not identical
};

/**
 * Aligns a geometric solid such that its top face and front face match desired values.
 * This is achieved by repeatedly rotating the solid randomly until the desired orientation is met.
 * @param {object} targetSolid - The solid object to be aligned.
 * @param {Array<number>} alignmentTargets - An array containing the desired top and front face values.
 * @returns {object} The aligned solid object.
 */
const alignSolid = (targetSolid, [desiredUpper, desiredFront]) => {
  const orientationVectors = ["North", "West", "South", "East"]; // Possible rotation directions

  // Continue rotating until the top and front faces match the desired values
  while (
    targetSolid.upperFaces[0] !== desiredUpper ||
    targetSolid.upperFaces[3] !== desiredFront
  ) {
    // Pick a random direction for rotation
    const currentVector =
      orientationVectors[
        NumericUtils.roundDown(
          NumericUtils.generateRandom() * orientationVectors.count
        )
      ];
    targetSolid = rotateSolid(targetSolid, currentVector); // Apply the rotation
  }

  return targetSolid; // Return the solid once aligned
};

/**
 * Creates a new geometric solid object based on an array of initial numeric values.
 * It defines the initial state of the upper and lateral faces.
 * @param {Array<number>} initialNumbers - An array of numbers representing the faces of the solid.
 * @returns {object} A new solid object with 'upperFaces' and 'lateralFaces' properties.
 */
const makeGeometricSolid = (initialNumbers) => ({
  // Define the initial configuration of the upper faces based on specific indices
  upperFaces: [1, 5, 6, 2].transformElements(
    (faceIndex) => initialNumbers[faceIndex - 1]
  ),
  // Define the initial configuration of the lateral faces based on specific indices
  lateralFaces: [1, 3, 6, 4].transformElements(
    (faceIndex) => initialNumbers[faceIndex - 1]
  ),
});

/**
 * Rotates a geometric solid in a specified direction and returns a new solid object.
 * The rotation logic updates the 'upperFaces' and 'lateralFaces' properties.
 * @param {object} solidToRotate - The solid object to be rotated.
 * @param {string} rotationDirection - The direction of rotation ('North', 'West', 'South', 'East').
 * @returns {object} A new solid object representing the state after rotation.
 */
const rotateSolid = (solidToRotate, rotationDirection) => {
  switch (rotationDirection) {
    case "West": {
      // Rotate West: lateral faces shift, upper faces update
      return ObjectUtilities.mergeProperties({}, solidToRotate, {
        upperFaces: [
          solidToRotate.lateralFaces[1],
          solidToRotate.upperFaces[1],
          solidToRotate.lateralFaces[3],
          solidToRotate.upperFaces[3],
        ],
        lateralFaces: solidToRotate.lateralFaces
          .extractSubset(1)
          .appendList([solidToRotate.lateralFaces[0]]),
      });
    }
    case "East": {
      // Rotate East: lateral faces shift, upper faces update
      return ObjectUtilities.mergeProperties({}, solidToRotate, {
        upperFaces: [
          solidToRotate.lateralFaces[solidToRotate.lateralFaces.count - 1],
          solidToRotate.upperFaces[1],
          solidToRotate.lateralFaces[1],
          solidToRotate.upperFaces[3],
        ],
        lateralFaces: [solidToRotate.lateralFaces[3]].appendList(
          solidToRotate.lateralFaces.extractSubset(0, -1)
        ),
      });
    }
    case "South": {
      // Rotate South: upper faces shift, lateral faces update
      return ObjectUtilities.mergeProperties({}, solidToRotate, {
        upperFaces: solidToRotate.upperFaces
          .extractSubset(1)
          .appendList([solidToRotate.upperFaces[0]]),
        lateralFaces: [
          solidToRotate.upperFaces[1],
          solidToRotate.lateralFaces[1],
          solidToRotate.upperFaces[3],
          solidToRotate.lateralFaces[3],
        ],
      });
    }
    case "North": {
      // Rotate North: upper faces shift, lateral faces update
      return ObjectUtilities.mergeProperties({}, solidToRotate, {
        upperFaces: [solidToRotate.upperFaces[3]].appendList(
          solidToRotate.upperFaces.extractSubset(0, -1)
        ),
        lateralFaces: [
          solidToRotate.upperFaces[3],
          solidToRotate.lateralFaces[1],
          solidToRotate.upperFaces[1],
          solidToRotate.lateralFaces[3],
        ],
      });
    }
  }
};