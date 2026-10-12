function Main(inputContent) {
    "use strict";

    const parseNumericLine = (lineString) => lineString.split(" ").map(Number);
    const [matrixHeight, matrixWidth, onesPerRowCount, zeroRowsCount] = parseNumericLine(inputContent.split("\n").shift());

    // Helper function to construct a binary row string based on a starting position and block length.
    // rowLength: The total number of columns in the row.
    // blockLength: The number of consecutive '1's in the block.
    // blockStartOffset: The conceptual starting column index for the block of '1's.
    //                   This value can be greater than rowLength, and will be taken modulo rowLength.
    const generateBinaryRow = (rowLength, blockLength, blockStartOffset) => {
        return Array.from({ length: rowLength }, (_, currentColumnIndex) => {
            const effectiveBlockStart = blockStartOffset % rowLength;
            const effectiveBlockEndAbsolute = effectiveBlockStart + blockLength;

            // Determine if the current column index falls within the '1' block.
            // This handles both non-wrapping and wrapping blocks.
            if (effectiveBlockEndAbsolute <= rowLength) {
                // Block does not wrap around the end of the row.
                return (currentColumnIndex >= effectiveBlockStart && currentColumnIndex < effectiveBlockEndAbsolute) ? '1' : '0';
            } else {
                // Block wraps around the end of the row.
                // '1's are from effectiveBlockStart to rowLength-1, AND from 0 to (effectiveBlockEndAbsolute % rowLength)-1.
                return (currentColumnIndex >= effectiveBlockStart || currentColumnIndex < effectiveBlockEndAbsolute % rowLength) ? '1' : '0';
            }
        }).join('');
    };

    if (zeroRowsCount === 0) {
        // Special case: 'b' (zeroRowsCount) is zero.
        // All rows are identical: 'a' ones followed by 'w-a' zeros.
        const uniformRowPattern = "1".repeat(onesPerRowCount) + "0".repeat(matrixWidth - onesPerRowCount);
        Array.from({ length: matrixHeight }).forEach(() => console.log(uniformRowPattern));
    } else if (onesPerRowCount === 0) {
        // Special case: 'a' (onesPerRowCount) is zero.
        // First 'b' rows are all zeros, remaining 'h-b' rows are all ones.
        const allZerosString = "0".repeat(matrixWidth);
        const allOnesString = "1".repeat(matrixWidth);
        Array.from({ length: matrixHeight }).forEach((_, currentMatrixRowIndex) => {
            console.log(currentMatrixRowIndex < zeroRowsCount ? allZerosString : allOnesString);
        });
    } else if (matrixHeight * onesPerRowCount !== matrixWidth * zeroRowsCount) {
        // Condition for an impossible pattern.
        console.log("No");
    } else {
        // General case: h * a === w * b.
        // Generate each row based on its index and the specific pattern rules.
        Array.from({ length: matrixHeight }).forEach((_, currentMatrixRowIndex) => {
            let rowBlockStartingPosition;
            if (matrixWidth % onesPerRowCount === 0) {
                // When 'w' is a multiple of 'a', the block shifts based on 'i / b'.
                rowBlockStartingPosition = Math.floor(currentMatrixRowIndex / zeroRowsCount) * onesPerRowCount;
            } else {
                // When 'w' is not a multiple of 'a', the block shifts based on 'i * a'.
                rowBlockStartingPosition = currentMatrixRowIndex * onesPerRowCount;
            }
            console.log(generateBinaryRow(matrixWidth, onesPerRowCount, rowBlockStartingPosition));
        });
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
