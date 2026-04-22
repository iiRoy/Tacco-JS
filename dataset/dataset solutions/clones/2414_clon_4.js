const inputRetrievalSystem = require('node:fs');

const extractGridInformation = (rawData) => {
    const dataRecords = rawData.trim().split('\n');
    const headerDetails = dataRecords.shift().split(' ').map(Number);
    const gridRowsCount = headerDetails[0]; // Corresponds to H
    const gridColumnsCount = headerDetails[1]; // Corresponds to W
    // headerDetails[2] is an unused value (K)
    const gridContentRows = dataRecords;
    return { gridRowsCount, gridColumnsCount, gridContentRows };
};

const processRowForMarkers = (currentLineText, columnSpan, identifierState) => {
    const markerLocations = Array.from(currentLineText)
        .map((character, position) => (character === '#' ? position : -1))
        .filter(position => position !== -1);

    if (markerLocations.length === 0) {
        return null; // Indicates a row without any markers, to be filled later
    }

    let columnCursor = 0;
    const rowOutputArray = new Array(columnSpan);

    markerLocations.forEach(markerColumnIndex => {
        identifierState.value++; // Increment the shared global counter
        const currentSegmentDesignation = identifierState.value;
        while (columnCursor <= markerColumnIndex) {
            rowOutputArray[columnCursor++] = currentSegmentDesignation;
        }
    });

    // Fill any remaining cells in the row with the last assigned designation
    while (columnCursor < columnSpan) {
        rowOutputArray[columnCursor++] = identifierState.value;
    }
    return rowOutputArray;
};

const propagateDesignationsDown = (preliminaryGridData) => {
    let lastValidDesignationRow = null;
    return preliminaryGridData.map(rowData => {
        if (rowData !== null) {
            lastValidDesignationRow = rowData;
            return rowData;
        } else {
            return lastValidDesignationRow; // Propagate from the last known valid row
        }
    });
};

const propagateDesignationsUp = (partiallyCompletedGrid) => {
    const reversedGridSegment = partiallyCompletedGrid.slice().reverse(); // Create a reversed copy
    let nextValidDesignationRow = null;
    const completedReversedSegments = reversedGridSegment.map(segmentData => {
        if (segmentData !== null) {
            nextValidDesignationRow = segmentData;
            return segmentData;
        } else {
            return nextValidDesignationRow; // Propagate from the next known valid row (from below)
        }
    });
    return completedReversedSegments.reverse(); // Restore original order
};

const executeGridTransformation = () => {
    const fileContents = inputRetrievalSystem.readFileSync('/dev/stdin', 'utf8');
    const { gridRowsCount, gridColumnsCount, gridContentRows } = extractGridInformation(fileContents);

    const globalDesignationCounter = { value: 0 }; // Mutable object to hold the shared ID counter

    // First stage: Assign unique IDs to segments in rows containing '#' markers.
    // Rows without markers are temporarily marked as 'null'.
    const initialDesignationPass = gridContentRows.map(lineText =>
        processRowForMarkers(lineText, gridColumnsCount, globalDesignationCounter)
    );

    // Second stage: Fill 'null' rows by propagating designations from the row directly above.
    const downwardPropagatedGrid = propagateDesignationsDown(initialDesignationPass);

    // Third stage: Fill any remaining 'null' rows (which would be at the top)
    // by propagating designations from the row directly below.
    const finalTransformedGrid = propagateDesignationsUp(downwardPropagatedGrid);

    // Format the resulting grid into the required string output.
    const finalOutputString = finalTransformedGrid
        .map(rowArray => rowArray.join(' '))
        .join('\n');

    console.log(finalOutputString);
};

executeGridTransformation();