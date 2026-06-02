const applyPermutation = (currentFaces, permutationIndices) =>
  permutationIndices.map((index) => currentFaces[index]);

const orientationTransforms = new Map([
  ["N", [1, 5, 2, 3, 0, 4]],
  ["S", [4, 0, 2, 3, 5, 1]],
  ["E", [3, 1, 0, 5, 4, 2]],
  ["W", [2, 1, 5, 0, 4, 3]],
]);

function reorientCube(directionKey, currentFaces) {
  const permutation = orientationTransforms.get(directionKey);
  return applyPermutation(currentFaces, permutation);
}

const spinPermutation = [0, 2, 4, 1, 3, 5];

function spinCube(currentFaces) {
  return applyPermutation(currentFaces, spinPermutation);
}

let globalSeenConfigurations = new Set();
let finalOutcome = "YES";

function checkAndRegisterOrientations(cubeFaces) {
  const localUniqueRotations = new Set();
  let mutableFaces = [...cubeFaces];

  Array.from({ length: 4 }).forEach(() => {
    const stateIdentifier = mutableFaces.join(",");
    localUniqueRotations.add(stateIdentifier);
    mutableFaces = spinCube(mutableFaces);
  });

  for (const configString of localUniqueRotations) {
    if (globalSeenConfigurations.has(configString)) {
      finalOutcome = "No";
      return;
    }
    globalSeenConfigurations.add(configString);
  }
}

const fileSystem = require("fs");
const rawInput = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputLines = rawInput.trim().split("\n");

const numCubes = Number(inputLines.shift());

for (let i = 0; i < numCubes; i++) {
  let currentCubeFaces = inputLines[i].split(" ").map(Number);

  for (let j = 0; j < 4; j++) {
    checkAndRegisterOrientations(currentCubeFaces);
    if (finalOutcome === "No") break;
    currentCubeFaces = reorientCube("N", currentCubeFaces);
  }
  if (finalOutcome === "No") break;

  currentCubeFaces = reorientCube("E", currentCubeFaces);
  checkAndRegisterOrientations(currentCubeFaces);
  if (finalOutcome === "No") break;

  currentCubeFaces = reorientCube("S", currentCubeFaces);
  currentCubeFaces = reorientCube("S", currentCubeFaces);
  checkAndRegisterOrientations(currentCubeFaces);
  if (finalOutcome === "No") break;
}

console.log(finalOutcome);
