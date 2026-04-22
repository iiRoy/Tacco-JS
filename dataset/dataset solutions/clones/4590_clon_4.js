function processInputData(rawData) {
    const numericStrings = rawData.trim().split(/\s+/);
    const firstVal = Number(numericStrings[0]);
    const secondVal = Number(numericStrings[1]);
    const thirdVal = Number(numericStrings[2]);

    function computeTransformations(paramA, paramB, paramC) {
        if (paramA === paramB && paramB === paramC) {
            return (paramA % 2 === 0) ? -1 : 0;
        }

        function stepRecursively(currentX, currentY, currentZ, counter) {
            if (currentX % 2 !== 0 || currentY % 2 !== 0 || currentZ % 2 !== 0) {
                return counter;
            }

            const nextX = (currentY + currentZ) / 2;
            const nextY = (currentX + currentZ) / 2;
            const nextZ = (currentX + currentY) / 2;

            return stepRecursively(nextX, nextY, nextZ, counter + 1);
        }

        return stepRecursively(paramA, paramB, paramC, 0);
    }

    const iterationCount = computeTransformations(firstVal, secondVal, thirdVal);
    console.log(iterationCount);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));