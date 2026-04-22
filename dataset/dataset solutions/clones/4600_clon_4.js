const handleTextStream = (incomingData) => {
    const cleanedStream = incomingData.trim();

    const segmentCoordinates = [];
    let currentPosition = 0;

    for (let idx = 0; idx < cleanedStream.length; idx++) {
        if (cleanedStream.at(idx) === ' ') {
            if (idx > currentPosition) {
                segmentCoordinates.push([currentPosition, idx - 1]);
            }
            currentPosition = idx + 1;
        }
    }
    if (currentPosition < cleanedStream.length) {
        segmentCoordinates.push([currentPosition, cleanedStream.length - 1]);
    }

    const firstSegTerminal = cleanedStream.at(segmentCoordinates[0][1]);
    const secondSegInitial = cleanedStream.at(segmentCoordinates[1][0]);
    const secondSegTerminal = cleanedStream.at(segmentCoordinates[1][1]);
    const thirdSegInitial = cleanedStream.at(segmentCoordinates[2][0]);

    const allConditionsMet = (firstSegTerminal === secondSegInitial) && (secondSegTerminal === thirdSegInitial);

    console.log(allConditionsMet ? 'YES' : 'NO');
};

handleTextStream(require("fs").readFileSync("/dev/stdin", "utf8"));