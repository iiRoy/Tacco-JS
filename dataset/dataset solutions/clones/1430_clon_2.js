function ProcessInputData (incomingText) {
    incomingText=incomingText.split("\n");

    let searchPattern = incomingText.shift();
    let patternLength = searchPattern.length;

    let currentLine = incomingText.shift();
    let occurrenceCount = 0;

    while ( currentLine !== "TERMINATE_SEARCH" ) {
        let currentScanPosition = 0;
        let lineTotalLength = currentLine.length;

        while( true ) {
            let matchStartOffset = currentLine.substring(currentScanPosition).indexOf(searchPattern);

            if (matchStartOffset + currentScanPosition > lineTotalLength - patternLength || matchStartOffset === -1) {
                break;
            }

            occurrenceCount += 1;
            currentScanPosition += matchStartOffset + patternLength;
        }

        currentLine = incomingText.shift();
    }

    console.log(occurrenceCount);
}
ProcessInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));