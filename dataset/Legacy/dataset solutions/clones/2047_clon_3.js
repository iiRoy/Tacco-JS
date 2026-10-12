function processInputData(rawDataString) {
    const inputLines = rawDataString.split("\n");

    const firstLineContent = inputLines[0];

    const totalLengthValue = parseInt(firstLineContent, 10);

    const calculateCubeVolume = (lengthDimension) => {
        const segmentSideLength = lengthDimension / 3;
        const volumeOfCube = Math.pow(segmentSideLength, 3);
        return volumeOfCube;
    };

    const finalCalculatedVolume = calculateCubeVolume(totalLengthValue);

    console.log(finalCalculatedVolume);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
