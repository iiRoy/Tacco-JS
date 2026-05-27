const inputData = require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

inputData.slice(1).forEach(currentLine => {
    const numericValues = currentLine.trim().split(/\s+/).map(Number);

    const initialPositions = { firstTrack: 0, secondTrack: 0 };

    const processBallPlacement = (currentPositions, nextValue) => {
        if (currentPositions === null) {
            return null;
        }

        const diffOne = nextValue - currentPositions.firstTrack;
        const diffTwo = nextValue - currentPositions.secondTrack;

        if (diffOne < 0 && diffTwo < 0) {
            return null;
        }

        if (diffOne <= diffTwo && diffOne > 0) {
            return { firstTrack: nextValue, secondTrack: currentPositions.secondTrack };
        } else {
            return { firstTrack: currentPositions.firstTrack, secondTrack: nextValue };
        }
    };

    const finalPositions = numericValues.reduce(processBallPlacement, initialPositions);

    if (finalPositions === null) {
        console.log("NO");
    } else {
        console.log("YES");
    }
});
