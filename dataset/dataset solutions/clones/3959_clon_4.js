function generateVisualPattern(firstInputVal, secondInputVal) {
    const canvasDimension = 100;
    const divisionPoint = 50;

    // Utilize a Map to efficiently store only the cell characters that deviate from the default pattern.
    // Keys are string representations of coordinates (e.g., "row_col"), values are characters.
    const modifiedLocations = new Map();

    // Determine and record modifications for the first input value (paramA in original logic).
    // These modifications place '.' characters in the top half of the grid (where default is '#').
    Array.from({ length: firstInputVal - 1 }, (_, index) => {
        const columnPosition = (index * 2) % canvasDimension;
        const rowPosition = Math.floor(index / canvasDimension) * 2;
        modifiedLocations.set(`${rowPosition}_${columnPosition}`, '.');
    });

    // Determine and record modifications for the second input value (paramB in original logic).
    // These modifications place '#' characters in the bottom half of the grid (where default is '.').
    Array.from({ length: secondInputVal - 1 }, (_, index) => {
        const columnPosition = (index * 2) % canvasDimension;
        const rowPosition = Math.floor(index / canvasDimension) * 2 + (divisionPoint + 1); // Equivalent to 51
        modifiedLocations.set(`${rowPosition}_${columnPosition}`, '#');
    });

    // Construct the final grid by iterating through each cell and determining its character.
    // If a cell's character is in 'modifiedLocations', use that; otherwise, use the default.
    const finalGridLines = Array.from({ length: canvasDimension }, (_, rowIndex) => {
        return Array.from({ length: canvasDimension }, (_, colIndex) => {
            const cellIdentifier = `${rowIndex}_${colIndex}`;
            if (modifiedLocations.has(cellIdentifier)) {
                return modifiedLocations.get(cellIdentifier);
            } else {
                // Default character: '#' for top half, '.' for bottom half
                return rowIndex < divisionPoint ? '#' : '.';
            }
        }).join(''); // Join characters to form a single string for the current row
    });

    // Output the dimensions of the grid
    console.log(`${canvasDimension} ${canvasDimension}`);
    // Output each constructed row
    finalGridLines.forEach(lineContent => console.log(lineContent));
}