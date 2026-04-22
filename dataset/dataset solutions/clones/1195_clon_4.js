const reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let collectedLines = [];

reader.on('line', (inputLine) => {
  collectedLines.push(inputLine);
});

reader.on('close', () => {
  const [initialValuesA, initialValuesB] = collectedLines
    .map(lineText => lineText.split(' ').map(numStr => parseInt(numStr, 10)));

  const firstStone = constructStone(initialValuesA);
  const secondStone = constructStone(initialValuesB);

  console.log(matchStones(firstStone, secondStone) ? 'Affirmative' : 'Negative');
});

// A die is represented as an array of 6 faces.
// The indices correspond to a fixed orientation:
// [0:Top, 1:Front, 2:Right, 3:Left, 4:Back, 5:Bottom]
const constructStone = (faceValues) => {
  // Assuming input faceValues are [F1, F2, F3, F4, F5, F6]
  // And the initial orientation maps them directly:
  // F1 on Top, F2 on Front, F3 on Right, F4 on Left, F5 on Back, F6 on Bottom
  return [
    faceValues[0], // Top
    faceValues[1], // Front
    faceValues[2], // Right
    faceValues[3], // Left
    faceValues[4], // Back
    faceValues[5]  // Bottom
  ];
};

// --- Rotation Functions ---
// These functions return a NEW die configuration after a roll or spin.
// They represent rolling the die in a specific direction.

// Rolls the die towards the North (pushes the die away from you, Front goes Down)
const shiftNorth = (currentStone) => {
  return [
    currentStone[4], // Back becomes Top
    currentStone[0], // Top becomes Front
    currentStone[2], // Right stays Right
    currentStone[3], // Left stays Left
    currentStone[5], // Bottom becomes Back
    currentStone[1]  // Front becomes Bottom
  ];
};

// Rolls the die towards the South (pulls the die towards you, Back goes Down)
const shiftSouth = (currentStone) => {
  return [
    currentStone[1], // Front becomes Top
    currentStone[5], // Bottom becomes Front
    currentStone[2], // Right stays Right
    currentStone[3], // Left stays Left
    currentStone[0], // Top becomes Back
    currentStone[4]  // Back becomes Bottom
  ];
};

// Rolls the die towards the East (pushes the die to the right, Left goes Down)
const shiftEast = (currentStone) => {
  return [
    currentStone[3], // Left becomes Top
    currentStone[1], // Front stays Front
    currentStone[0], // Top becomes Right
    currentStone[5], // Bottom becomes Left
    currentStone[4], // Back stays Back
    currentStone[2]  // Right becomes Bottom
  ];
};

// Rolls the die towards the West (pushes the die to the left, Right goes Down)
const shiftWest = (currentStone) => {
  return [
    currentStone[2], // Right becomes Top
    currentStone[1], // Front stays Front
    currentStone[5], // Bottom becomes Right
    currentStone[0], // Top becomes Left
    currentStone[4], // Back stays Back
    currentStone[3]  // Left becomes Bottom
  ];
};

// Spins the die clockwise on its current Top face (vertical axis rotation)
const spinClockwise = (currentStone) => {
  return [
    currentStone[0], // Top stays Top
    currentStone[3], // Left becomes Front
    currentStone[1], // Front becomes Right
    currentStone[4], // Back becomes Left
    currentStone[2], // Right becomes Back
    currentStone[5]  // Bottom stays Bottom
  ];
};

// Generates all 24 unique orientations of a given die.
// A die has 6 faces that can be on top. For each top face, there are 4 orientations
// for the front face (after fixing the top), totaling 6 * 4 = 24 unique configurations.
const enumerateConfigurations = (initialStone) => {
  const allConfigs = new Set();
  let currentConfig;

  // Systematically generate all 24 orientations:
  // Iterate through 6 possible faces for the 'Top' position.
  // For each 'Top' face, iterate through 4 possible 'Front' faces by spinning.

  // 1. Initial Top face (initial index 0)
  currentConfig = initialStone;
  for (let i = 0; i < 4; i++) {
    allConfigs.add(JSON.stringify(currentConfig));
    currentConfig = spinClockwise(currentConfig);
  }

  // 2. Top face becomes initial Back face (initial index 4)
  currentConfig = shiftNorth(initialStone);
  for (let i = 0; i < 4; i++) {
    allConfigs.add(JSON.stringify(currentConfig));
    currentConfig = spinClockwise(currentConfig);
  }

  // 3. Top face becomes initial Bottom face (initial index 5)
  currentConfig = shiftNorth(shiftNorth(initialStone));
  for (let i = 0; i < 4; i++) {
    allConfigs.add(JSON.stringify(currentConfig));
    currentConfig = spinClockwise(currentConfig);
  }

  // 4. Top face becomes initial Front face (initial index 1)
  currentConfig = shiftSouth(initialStone); // Equivalent to shiftNorth x 3
  for (let i = 0; i < 4; i++) {
    allConfigs.add(JSON.stringify(currentConfig));
    currentConfig = spinClockwise(currentConfig);
  }

  // 5. Top face becomes initial Right face (initial index 2)
  currentConfig = shiftWest(initialStone);
  for (let i = 0; i < 4; i++) {
    allConfigs.add(JSON.stringify(currentConfig));
    currentConfig = spinClockwise(currentConfig);
  }

  // 6. Top face becomes initial Left face (initial index 3)
  currentConfig = shiftEast(initialStone);
  for (let i = 0; i < 4; i++) {
    allConfigs.add(JSON.stringify(currentConfig));
    currentConfig = spinClockwise(currentConfig);
  }

  return allConfigs;
};

// Checks if two dice are equivalent (can be rotated into each other).
const matchStones = (stoneA, stoneB) => {
  const configurationsOfA = enumerateConfigurations(stoneA);
  const stringifiedStoneB = JSON.stringify(stoneB);
  return configurationsOfA.has(stringifiedStoneB);
};