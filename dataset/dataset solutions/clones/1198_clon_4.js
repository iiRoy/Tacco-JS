const transformCube = (commandIdentifier, currentLayout) => {
    const transformationRules = new Map([
        ["N", ([faceOne, faceTwo, faceThree, faceFour, faceFive, faceSix]) => [faceTwo, faceSix, faceThree, faceFour, faceOne, faceFive]],
        ["S", ([faceOne, faceTwo, faceThree, faceFour, faceFive, faceSix]) => [faceFive, faceOne, faceThree, faceFour, faceSix, faceTwo]],
        ["E", ([faceOne, faceTwo, faceThree, faceFour, faceFive, faceSix]) => [faceFour, faceTwo, faceOne, faceSix, faceFive, faceThree]],
        ["W", ([faceOne, faceTwo, faceThree, faceFour, faceFive, faceSix]) => [faceThree, faceTwo, faceSix, faceOne, faceFive, faceFour]]
    ]);
    const applyTransformation = transformationRules.get(commandIdentifier);
    return applyTransformation ? applyTransformation(currentLayout) : currentLayout;
};

const rotateFaces = ([faceOne, faceTwo, faceThree, faceFour, faceFive, faceSix]) => [faceOne, faceThree, faceFive, faceTwo, faceFour, faceSix];

const encounteredStates = new Set();
let overallResult = "Yes";

const analyzeOrientations = (initialArrangement) => {
    if (overallResult === "No") return;

    let currentArrangement = [...initialArrangement];
    const temporaryOrientations = new Set();

    Array.from({ length: 4 }).forEach(() => {
        temporaryOrientations.add(currentArrangement.join(","));
        currentArrangement = rotateFaces(currentArrangement);
    });

    for (const stateString of temporaryOrientations) {
        if (encounteredStates.has(stateString)) {
            overallResult = "No";
            return;
        }
        encounteredStates.add(stateString);
    }
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split("\n");

let numberOfConfigurations = Number(lines.shift());

let configIndex = 0;
while (configIndex < numberOfConfigurations && overallResult === "Yes") {
    let currentCube = lines[configIndex].split(" ").map(Number);

    Array.from({ length: 4 }).forEach(() => {
        analyzeOrientations(currentCube);
        currentCube = transformCube("N", currentCube);
    });

    currentCube = transformCube("E", currentCube);
    analyzeOrientations(currentCube);

    currentCube = transformCube("S", currentCube);
    currentCube = transformCube("S", currentCube);
    analyzeOrientations(currentCube);

    configIndex++;
}

console.log(overallResult);
