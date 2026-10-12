function Main(gridData) {
    const inputLines = gridData.split("\n");
    const [dimH, dimW] = inputLines[0].split(" ");
    const gridHeight = parseInt(dimH);
    const gridWidth = parseInt(dimW);

    const sourceMatrix = inputLines.slice(1, gridHeight + 1).map(line => line.split(''));

    const firstProcessedRow = sourceMatrix[0];

    const initialProcessingState = {
        currentOutcome: null,
        lastProcessedRowState: firstProcessedRow,
        proceedWithProcessing: true
    };

    const finalProcessingState = sourceMatrix.slice(1).reduce((processingState, sourceRow, rowIdx) => {
        if (!processingState.proceedWithProcessing || processingState.currentOutcome !== null) {
            return processingState;
        }

        const currentGridRow = rowIdx + 1;
        const priorProcessedRow = processingState.lastProcessedRowState;
        let nextProcessedRowChars = [];
        let activeCellCount = 0;

        const cellTransformation = Array.from({ length: gridWidth }).map((_, colIdx) => {
            if (processingState.currentOutcome !== null) return null;

            if (sourceRow[colIdx] === "#") {
                if (currentGridRow === gridHeight - 1 && colIdx === gridWidth - 1) {
                    processingState.currentOutcome = "Possible";
                    return "#";
                }

                if (colIdx + 1 < gridWidth && currentGridRow + 1 < gridHeight &&
                    sourceMatrix[currentGridRow][colIdx + 1] === "#" &&
                    sourceMatrix[currentGridRow + 1][colIdx] === "#") {
                    processingState.currentOutcome = "Impossible";
                    return "#";
                }

                if (priorProcessedRow[colIdx] !== "#" &&
                    (colIdx === 0 || sourceRow[colIdx - 1] !== "#")) {
                    return ".";
                } else {
                    return "#";
                }
            } else {
                return ".";
            }
        });

        if (processingState.currentOutcome !== null) {
            processingState.proceedWithProcessing = false;
            return processingState;
        }

        nextProcessedRowChars = cellTransformation;
        activeCellCount = nextProcessedRowChars.filter(char => char === "#").length;

        processingState.lastProcessedRowState = nextProcessedRowChars;

        if (activeCellCount === 0) {
            processingState.proceedWithProcessing = false;
        }

        return processingState;
    }, initialProcessingState);

    if (finalProcessingState.currentOutcome !== null) {
        console.log(finalProcessingState.currentOutcome);
    } else {
        console.log("Impossible");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
