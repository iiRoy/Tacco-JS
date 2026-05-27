function processInputData(rawData) {
    const lineDelimiter = "\n";
    const itemDelimiter = ' ';

    let inputLines = rawData.split(lineDelimiter);

    const extractSongDetails = (lineContent) => {
        const parts = lineContent.split(itemDelimiter);
        return {
            title: parts[0],
            duration: Number(parts[1])
        };
    };

    const totalSongsCount = Number(inputLines[0]);
    const targetSongIdentifier = inputLines[totalSongsCount + 1];

    let allSongsData = [];
    for (let currentLineIndex = 1; currentLineIndex <= totalSongsCount; currentLineIndex++) {
        allSongsData.push(extractSongDetails(inputLines[currentLineIndex]));
    }

    let accumulatedTime = 0;

    for (let songPosition = 0; songPosition < allSongsData.length; songPosition++) {
        const currentSongObject = allSongsData[songPosition];

        if (currentSongObject.title === targetSongIdentifier) {
            for (let subsequentPosition = songPosition + 1; subsequentPosition < allSongsData.length; subsequentPosition++) {
                accumulatedTime += allSongsData[subsequentPosition].duration;
            }
            return console.log(accumulatedTime);
        }
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
