console.log((inputData => {
    const lines = inputData.trim().split('\n');
    const [dimensionsLine, ...sourcePattern] = lines;
    const [heightString, widthString, keyCountString] = dimensionsLine.split(' ');
    const gridHeight = parseInt(heightString, 10);
    const gridWidth = parseInt(widthString, 10);
    const initialKeyCount = parseInt(keyCountString, 10); // This value is parsed but not utilized in the core logic, mirroring original behavior.

    let assignedValues = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));
    let nextIdentifier = 0;

    // First pass: Identify all '#' cells and assign them unique, sequential identifiers.
    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            if (sourcePattern[r][c] === '#') {
                nextIdentifier++;
                assignedValues[r][c] = nextIdentifier;
            }
        }
    }

    let stateChanged = true;
    // Iteratively propagate identifiers to adjacent empty cells until no more changes occur.
    // This fixed-point iteration ensures all reachable empty cells are filled.
    while (stateChanged) {
        stateChanged = false;
        // Create a new grid for the next iteration's state.
        // This ensures all updates in the current iteration are based on the *previous* stable state.
        const nextAssignedValues = assignedValues.map(row => [...row]);

        for (let r = 0; r < gridHeight; r++) {
            for (let c = 0; c < gridWidth; c++) {
                // Only attempt to update cells that are currently unassigned (value 0).
                if (assignedValues[r][c] === 0) {
                    let candidateId = 0;

                    // Check all four cardinal neighbors for an assigned identifier.
                    // If a neighbor has an ID, consider it as a candidate.
                    // The smallest candidate ID takes precedence.

                    // Check left neighbor
                    if (c > 0 && assignedValues[r][c - 1] !== 0) {
                        candidateId = candidateId === 0 ? assignedValues[r][c - 1] : Math.min(candidateId, assignedValues[r][c - 1]);
                    }
                    // Check right neighbor
                    if (c < gridWidth - 1 && assignedValues[r][c + 1] !== 0) {
                        candidateId = candidateId === 0 ? assignedValues[r][c + 1] : Math.min(candidateId, assignedValues[r][c + 1]);
                    }
                    // Check upper neighbor
                    if (r > 0 && assignedValues[r - 1][c] !== 0) {
                        candidateId = candidateId === 0 ? assignedValues[r - 1][c] : Math.min(candidateId, assignedValues[r - 1][c]);
                    }
                    // Check lower neighbor
                    if (r < gridHeight - 1 && assignedValues[r + 1][c] !== 0) {
                        candidateId = candidateId === 0 ? assignedValues[r + 1][c] : Math.min(candidateId, assignedValues[r + 1][c]);
                    }

                    // If a valid candidate ID was found, assign it to the current cell.
                    // Mark that a change occurred, necessitating another iteration.
                    if (candidateId !== 0) {
                        nextAssignedValues[r][c] = candidateId;
                        stateChanged = true;
                    }
                }
            }
        }
        // Update the main grid with the newly computed state for the next iteration.
        assignedValues = nextAssignedValues;
    }

    // Format the final grid into the required string output.
    return assignedValues.map(row => row.join(' ')).join('\n');
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
