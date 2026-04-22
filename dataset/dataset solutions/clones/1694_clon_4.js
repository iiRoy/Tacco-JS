const solveMatrixProblem = (sourceData) => {
    const problemSpecification = ((rawData) => {
        const dataLines = rawData.split('\n');
        const [dimAStr, dimBStr, targetCountStr] = dataLines[0].split(' ');

        const dimensionA = Number(dimAStr);
        const dimensionB = Number(dimBStr);
        const targetValue = Number(targetCountStr);

        const matrixContent = dataLines.slice(1, 1 + dimensionA).map(lineContent => [...lineContent]);

        return {
            verticalExtent: dimensionA,
            horizontalExtent: dimensionB,
            desiredHashCount: targetValue,
            characterMatrix: matrixContent
        };
    })(sourceData);

    const computedResult = ((spec) => {
        const { verticalExtent, horizontalExtent, desiredHashCount, characterMatrix } = spec;
        let successfulSelections = 0;

        for (let rowSelectionPattern = 0; rowSelectionPattern < (1 << verticalExtent); rowSelectionPattern++) {
            for (let colSelectionPattern = 0; colSelectionPattern < (1 << horizontalExtent); colSelectionPattern++) {
                let currentHashTally = 0;

                for (let r = 0; r < verticalExtent; r++) {
                    const isRowConsidered = !((rowSelectionPattern >> r) & 1);

                    if (isRowConsidered) {
                        for (let c = 0; c < horizontalExtent; c++) {
                            const isColumnConsidered = !((colSelectionPattern >> c) & 1);

                            if (isColumnConsidered && characterMatrix[r][c] === '#') {
                                currentHashTally++;
                            }
                        }
                    }
                }

                if (currentHashTally === desiredHashCount) {
                    successfulSelections++;
                }
            }
        }
        return successfulSelections;
    })(problemSpecification);

    console.log('%s', computedResult);
    return computedResult;
};

solveMatrixProblem(require("fs").readFileSync("/dev/stdin", "utf8"));