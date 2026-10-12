let inputBuffer = ''; // Buffer to accumulate input data from stdin

process.stdin.resume(); // Keep the process alive for input
process.stdin.setEncoding('utf8'); // Set encoding for incoming data

// Event listener for 'data' chunks from stdin
process.stdin.on('data', (chunkOfData) => {
  inputBuffer += chunkOfData; // Append each chunk to the buffer
});

// Event listener for 'end' of stdin input
process.stdin.on('end', () => {
  // Process the accumulated input data
  const [firstCube, secondCube] = inputBuffer
    .trim() // Remove leading/trailing whitespace
    .split('\n') // Split into individual lines
    .map((inputLine) => inputLine.split(' ').map((val) => parseInt(val, 10))) // Parse numbers from each line
    .map((numberValues) => makeCube(numberValues)); // Create cube objects from parsed numbers

  // Compare the two cubes and print the result
  console.log(compareCubes(firstCube, secondCube) ? 'Yes' : 'No');
});

/**
 * Compares two cube objects to determine if they can be rotated into the same orientation.
 * Uses a randomized approach within a time limit.
 * @param {object} firstCube - The first cube object.
 * @param {object} secondCube - The second cube object.
 * @returns {boolean} True if the cubes can be made identical, false otherwise.
 */
const compareCubes = (firstCube, secondCube) => {
  const endTime = Date.now() + 400; // Set a time limit (400ms) for the comparison loop

  // Continuously rotate the first cube and check for equality until time runs out
  while (Date.now() < endTime) {
    const directions = ['N', 'W', 'S', 'E']; // Possible rotation directions
    const currentDirection = directions[Math.floor(Math.random() * directions.length)]; // Pick a random direction

    firstCube = rotateCube(firstCube, currentDirection); // Apply the rotation to the first cube

    // Check if the current orientation of firstCube matches secondCube
    const areIdentical =
      firstCube.side.every((val, idx) => val === secondCube.side[idx]) &&
      firstCube.upper.every((val, idx) => val === secondCube.upper[idx]);

    if (areIdentical) {
      return true; // Cubes are identical in this orientation
    }
  }

  return false; // Time ran out, no identical orientation found
};

/**
 * Orients a cube so that its top face and front face match specified values.
 * Uses random rotations until the desired orientation is achieved.
 * @param {object} currentCube - The cube object to orient.
 * @param {number[]} targetFaces - An array containing the target top face value and front face value.
 * @returns {object} The oriented cube object.
 */
const orientCube = (currentCube, [upperFace, frontFace]) => {
  const directions = ['N', 'W', 'S', 'E']; // Available movement options

  // Keep rotating until the top and front faces match the targets
  while (currentCube.upper[0] !== upperFace || currentCube.upper[3] !== frontFace) {
    const currentDirection = directions[Math.floor(Math.random() * directions.length)]; // Choose a random direction
    currentCube = rotateCube(currentCube, currentDirection); // Apply the rotation
  }

  return currentCube; // Return the cube in the desired orientation
};

/**
 * Creates a cube object from an array of numbers representing its faces.
 * The numbers are mapped to specific positions on the cube's 'upper' and 'side' arrays.
 * @param {number[]} numberValues - An array of 6 numbers representing the cube's faces.
 * @returns {object} A new cube object with 'upper' and 'side' properties.
 */
const makeCube = (numberValues) => ({
  // 'upper' represents the top, front, bottom, back faces in a specific order
  upper: [1, 5, 6, 2].map((val) => numberValues[val - 1]),
  // 'side' represents the top, right, bottom, left faces in a specific order
  side: [1, 3, 6, 4].map((val) => numberValues[val - 1]),
});

/**
 * Rotates a cube object in a specified direction (N, W, S, E).
 * Returns a new cube object representing the rotated state.
 * @param {object} currentCube - The cube object to rotate.
 * @param {string} currentDirection - The direction of rotation ('N', 'W', 'S', 'E').
 * @returns {object} A new cube object after rotation.
 */
const rotateCube = (currentCube, currentDirection) => {
  switch (currentDirection) {
    case 'W': {
      // Rotate West: top face moves to right, right face rotates
      return Object.assign({}, currentCube, {
        upper: [currentCube.side[1], currentCube.upper[1], currentCube.side[3], currentCube.upper[3]],
        side: currentCube.side.slice(1).concat([currentCube.side[0]]), // Shift right faces left
      });
    }
    case 'E': {
      // Rotate East: top face moves to left, right face rotates
      return Object.assign({}, currentCube, {
        upper: [
          currentCube.side[currentCube.side.length - 1],
          currentCube.upper[1],
          currentCube.side[1],
          currentCube.upper[3],
        ],
        side: [currentCube.side[3]].concat(currentCube.side.slice(0, -1)), // Shift right faces right
      });
    }
    case 'S': {
      // Rotate South: top face rotates, right face updates from top
      return Object.assign({}, currentCube, {
        upper: currentCube.upper.slice(1).concat([currentCube.upper[0]]), // Shift upper faces left
        side: [currentCube.upper[1], currentCube.side[1], currentCube.upper[3], currentCube.side[3]],
      });
    }
    case 'N': {
      // Rotate North: top face rotates, right face updates from top
      return Object.assign({}, currentCube, {
        upper: [currentCube.upper[3]].concat(currentCube.upper.slice(0, -1)), // Shift upper faces right
        side: [currentCube.upper[3], currentCube.side[1], currentCube.upper[1], currentCube.side[3]],
      });
    }
  }
};
