function createFilledArray(size, initialValue) {
    const resultArr = new Array(size);
    for (let i = 0; i < size; i++) {
        resultArr[i] = initialValue;
    }
    return resultArr;
}

function processGolemInstructions(rawData) {
    const inputLines = rawData.split("\n");

    const golemFieldSize = parseInt(inputLines[0].split(" ")[0], 10);
    const golemTypeSequence = inputLines[1];
    const instructionSet = inputLines.slice(2);

    let currentGolemPopulation = createFilledArray(golemFieldSize, 1);

    for (const currentInstruction of instructionSet) {
        const targetGolemChar = currentInstruction[0];
        const movementDirection = currentInstruction[2]; // 'L' or 'R'

        let nextGolemPopulation = createFilledArray(golemFieldSize, 0);

        for (let currentPosition = 0; currentPosition < golemFieldSize; currentPosition++) {
            const golemsAtCurrentPos = currentGolemPopulation[currentPosition];
            if (golemsAtCurrentPos === 0) {
                continue;
            }

            let destinationPosition = currentPosition;
            const isMatchingType = golemTypeSequence[currentPosition] === targetGolemChar;

            if (isMatchingType) {
                if (movementDirection === "L") {
                    if (currentPosition > 0) {
                        destinationPosition = currentPosition - 1;
                    } else {
                        // Golem attempts to move off the left edge, it is removed.
                        continue;
                    }
                } else { // movementDirection === "R"
                    if (currentPosition < golemFieldSize - 1) {
                        destinationPosition = currentPosition + 1;
                    } else {
                        // Golem attempts to move off the right edge, it is removed.
                        continue;
                    }
                }
            }
            // If not matching type, or if matching type but couldn't move (e.g., hit boundary and not removed),
            // it stays at its currentPosition.
            nextGolemPopulation[destinationPosition] += golemsAtCurrentPos;
        }
        currentGolemPopulation = Array.from(nextGolemPopulation);
    }

    const finalGolemCount = currentGolemPopulation.reduce((accumulator, count) => accumulator + count, 0);
    console.log(finalGolemCount);
}

processGolemInstructions(require("fs").readFileSync("/dev/stdin", "utf8"));
