function processInput(rawContent) {
    const contentLines = rawContent.split("\n");
    const trackCount = Number(contentLines[0]);
    const targetTrackName = contentLines[trackCount + 1];

    const trackDetails = contentLines.slice(1, trackCount + 1).map(lineEntry => {
        const segmentParts = lineEntry.split(' ');
        return {
            tuneIdentifier: segmentParts[0],
            durationValue: Number(segmentParts[1])
        };
    });

    const matchingTrackIndex = trackDetails.findIndex(trackItem => trackItem.tuneIdentifier === targetTrackName);

    if (matchingTrackIndex !== -1) {
        const subsequentTracks = trackDetails.slice(matchingTrackIndex + 1);
        const totalSubsequentDuration = subsequentTracks.reduce((accumulator, currentItem) => accumulator + currentItem.durationValue, 0);
        console.log(totalSubsequentDuration);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
