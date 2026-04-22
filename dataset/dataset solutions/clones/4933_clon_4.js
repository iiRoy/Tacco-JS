process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputBuffer = [];
var inputParser = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputParser.on('line', (inputLine) => {
  inputBuffer.push(inputLine);
});

inputParser.on('close', () => {
    const [_, firstCap, secondCap] = inputBuffer[0].split(" ").map(Number);
    const charSequence = inputBuffer[1].split("");

    function determineApprovals(
        remainingChars,
        overallTally,
        typeBTally,
        resultsAccumulator
    ) {
        if (remainingChars.length === 0) {
            return resultsAccumulator;
        }

        const currentCharacter = remainingChars[0];
        const restOfChars = remainingChars.slice(1);

        let currentVerdict = false;
        let nextOverallTally = overallTally;
        let nextTypeBTally = typeBTally;

        if (overallTally < (firstCap + secondCap)) {
            if (currentCharacter === "a") {
                nextOverallTally++;
                currentVerdict = true;
            } else if (currentCharacter === "b" && typeBTally < secondCap) {
                nextOverallTally++;
                nextTypeBTally++;
                currentVerdict = true;
            }
        }

        return determineApprovals(
            restOfChars,
            nextOverallTally,
            nextTypeBTally,
            [...resultsAccumulator, currentVerdict]
        );
    }

    const finalDecisions = determineApprovals(charSequence, 0, 0, []);

    const formattedOutput = finalDecisions.map(decision => decision ? "Yes" : "No").join("\n");
    console.log(formattedOutput);
});