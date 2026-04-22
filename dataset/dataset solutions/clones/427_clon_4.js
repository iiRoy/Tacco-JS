(function() {
    const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
    const sourceLines = dataSource.trim().split('\n');

    // Recursive processor for input segments
    const segmentProcessor = (currentLineIndex, interimScores, finalReportEntries) => {
        if (currentLineIndex >= sourceLines.length) {
            return finalReportEntries; // All input lines consumed
        }

        const activeLineContent = sourceLines[currentLineIndex];

        // Halt condition: "0 0" encountered at the start of a new collection cycle
        if (activeLineContent === "0 0" && interimScores.length === 0) {
            return finalReportEntries;
        }

        let nextInterimScores = [...interimScores];
        let nextFinalReportEntries = [...finalReportEntries];

        // Process line content if it's not the "0 0" terminator
        if (activeLineContent !== "0 0") {
            const numericElements = activeLineContent.split(" ").map(Number);
            nextInterimScores.push(numericElements[0] + numericElements[1]);
        }

        // Check if a complete set of five scores has been gathered
        if (nextInterimScores.length === 5) {
            const highestRating = Math.max(...nextInterimScores);
            const highestRatingPosition = nextInterimScores.indexOf(highestRating);
            const positionIdentifier = String.fromCharCode('A'.charCodeAt(0) + highestRatingPosition);
            nextFinalReportEntries.push(`${positionIdentifier} ${highestRating}`);
            nextInterimScores = []; // Reset the collection for the next set
        }

        // Advance to the next line in the input
        return segmentProcessor(currentLineIndex + 1, nextInterimScores, nextFinalReportEntries);
    };

    const generatedReport = segmentProcessor(0, [], []);
    generatedReport.forEach(entry => console.log(entry));
})();