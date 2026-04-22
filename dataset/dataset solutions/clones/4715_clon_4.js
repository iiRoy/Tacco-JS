function ProcessGridData(rawTextInput) {
    const allTextLines = rawTextInput.split('\n');

    const firstLineValues = allTextLines[0].split(' ').map(Number);
    const primaryDimension = firstLineValues[0];
    const secondaryDimension = firstLineValues[1];

    const largeGridRepresentation = allTextLines.slice(1, 1 + primaryDimension);
    const smallPatternRepresentation = allTextLines.slice(1 + primaryDimension, 1 + primaryDimension + secondaryDimension);

    const verifySubgridMatch = (rowOffset, colOffset) => {
        return Array.from({ length: secondaryDimension }).every((_, patternRowIndex) => {
            return Array.from({ length: secondaryDimension }).every((_, patternColIndex) => {
                return largeGridRepresentation[rowOffset + patternRowIndex][colOffset + patternColIndex] === smallPatternRepresentation[patternRowIndex][patternColIndex];
            });
        });
    };

    const maxPossibleRowOffset = primaryDimension - secondaryDimension;
    const maxPossibleColOffset = primaryDimension - secondaryDimension;

    let existenceConfirmed = false;

    if (maxPossibleRowOffset >= 0 && maxPossibleColOffset >= 0) {
        const potentialTopLeftCoordinates = Array.from({ length: maxPossibleRowOffset + 1 }).flatMap((_, rShift) =>
            Array.from({ length: maxPossibleColOffset + 1 }).map((_, cShift) => ({ r: rShift, c: cShift }))
        );

        existenceConfirmed = potentialTopLeftCoordinates.some(coords =>
            verifySubgridMatch(coords.r, coords.c)
        );
    }
    
    console.log(existenceConfirmed ? "Yes" : "No");
}

ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));