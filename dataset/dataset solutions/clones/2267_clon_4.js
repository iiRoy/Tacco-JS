function processInputData(unparsedText) {
    const lineSegments = unparsedText.split("\n");
    const totalSongCount = Number(lineSegments[0]);
    const searchTargetSongName = lineSegments[totalSongCount + 1];

    const songRecords = lineSegments.slice(1, totalSongCount + 1).map(currentEntry => {
        const parts = currentEntry.split(' ');
        return {
            tuneName: parts[0],
            durationValue: Number(parts[1])
        };
    });

    const matchingSongIndex = songRecords.findIndex(record => record.tuneName === searchTargetSongName);

    if (matchingSongIndex !== -1) {
        const subsequentSongs = songRecords.slice(matchingSongIndex + 1);
        const accumulatedTime = subsequentSongs.reduce((currentSum, songItem) => {
            return currentSum + songItem.durationValue;
        }, 0);
        console.log(accumulatedTime);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));