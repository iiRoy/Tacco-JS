function obtainNumericValue(sourceString) {
    return Number(sourceString);
}

function computeCubeVolume(totalDimensionSum) {
    const sideLengthOfCube = totalDimensionSum / 3;
    const calculatedResultingVolume = sideLengthOfCube * sideLengthOfCube * sideLengthOfCube;
    return calculatedResultingVolume;
}

function processInputForVolumeCalculation(rawInputData) {
    const lengthValue = obtainNumericValue(rawInputData);
    const finalVolumeOutput = computeCubeVolume(lengthValue);
    console.log(finalVolumeOutput);
}

processInputForVolumeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
