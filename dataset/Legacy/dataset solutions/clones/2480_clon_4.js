const processContainerAngle = (inputLines) => {
    const [dimA, dimB, waterVol] = inputLines[0].split(' ').map(Number);

    const degreesPerRadian = 180 / Math.PI;

    const calculateTiltAngle = (lengthA, heightB, currentVolume) => {
        const fullContainerVolume = Math.pow(lengthA, 2) * heightB;

        const angleInRadians = (currentVolume * 2 >= fullContainerVolume)
            ? Math.atan((2 * (heightB - currentVolume / Math.pow(lengthA, 2))) / lengthA)
            : Math.atan(heightB / ((2 * currentVolume) / (lengthA * heightB)));

        return angleInRadians * degreesPerRadian;
    };

    const finalCalculatedAngle = calculateTiltAngle(dimA, dimB, waterVol);
    console.log(finalCalculatedAngle.toString());
};

processContainerAngle(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
