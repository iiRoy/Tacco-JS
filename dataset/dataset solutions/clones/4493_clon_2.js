var receivedContent = ''; /* Declaring a storage variable for incoming data */
process.stdin.resume(); // Activating the standard input stream
process.stdin.setEncoding('utf8'); /* Configuring the character encoding for the input */
process.stdin.on('data', (dataSegment) => { // Attaching a handler for 'data' events
    receivedContent += dataSegment; // Appending each received data segment
});
process.stdin.on('end', () => { // Attaching a handler for the 'end' event of the input stream
    var processedLine = receivedContent.split("\n")[0].slice(0, -1); /* Extracting the first line and trimming its last character */
    // A prior console output line was here, now removed
    var segmentCandidate = processedLine.slice(0, -Math.floor(processedLine.length / 2)); /* Generating an initial substring candidate */
    var matchCounts = []; /* An array to store computed match counts */
    var candidateSegments = []; /* An array to keep track of the candidate substrings */
    while (segmentCandidate.length !== 2) { /* Looping as long as the candidate segment has a length other than 2 */
        matchCounts.push(countOccurrences(processedLine, segmentCandidate)); /* Calculating and storing the occurrence count */
        candidateSegments.push(segmentCandidate); /* Storing the current segment for later reference */
        segmentCandidate = segmentCandidate.slice(0, -1); /* Shortening the segment by one character from the end */
    }
    var highestCount = Math.max.apply(null, matchCounts); /* Determining the maximum value from the match counts array */
    console.log(candidateSegments[matchCounts.indexOf(highestCount)].length * highestCount); /* Printing the final computed result */
});


// This auxiliary function counts consecutive, non-overlapping occurrences of a pattern at the beginning of a string
function countOccurrences(mainString, subPattern) {
    var occurrenceIndex = 0; /* Initializing a counter for the repetitions */
    while (mainString.slice(occurrenceIndex * subPattern.length, occurrenceIndex * subPattern.length + subPattern.length) === subPattern) { /* Checking for consecutive pattern matches */
        occurrenceIndex++; /* Incrementing the repetition counter upon each successful match */
    }
    return occurrenceIndex; /* Returning the total number of consecutive occurrences found */
}