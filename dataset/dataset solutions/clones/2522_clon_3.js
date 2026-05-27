function processInputData(rawText) {
    const parseDecimalInt = (strValue) => parseInt(strValue, 10);

    const inputLines = rawText.split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const totalParticipants = parseDecimalInt(firstLineParts[0]);
    const heightThreshold = parseDecimalInt(firstLineParts[1]);
  
    const participantHeightsStr = inputLines[1].split(" ");
  
    let qualifiedCount = 0;
  
    for (let currentIdx = 0; currentIdx < totalParticipants; currentIdx++) {
        const individualHeight = parseDecimalInt(participantHeightsStr[currentIdx]);
        if (individualHeight >= heightThreshold) {
            qualifiedCount++;
        }
    }
  
    console.log(qualifiedCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
