function processInput(rawDataString) {
    const inputLines = rawDataString.split('\n');

    const sequenceLength = Number(inputLines[0]);

    const inputSequence = Array.from(inputLines[1], char => Number(char));

    const hasThreeDigitSubsequence = (numCandidate, sequence) => {
        const numString = String(numCandidate);
        const targetChars = [
            numString.charAt(0),
            numString.charAt(1),
            numString.charAt(2)
        ];

        let matchProgress = 0;
        const REQUIRED_MATCHES = 3;

        for (let i = 0; i < sequence.length; i++) {
            if (matchProgress < REQUIRED_MATCHES) {
                if (targetChars[matchProgress] == sequence[i]) {
                    matchProgress++;
                }
            } else {
                break;
            }
        }
        return matchProgress === REQUIRED_MATCHES;
    };

    let totalFoundCombinations = 0;
    const MAX_NUMBER_CANDIDATE = 1000;

    for (let currentNum = 0; currentNum < MAX_NUMBER_CANDIDATE; currentNum++) {
        if (hasThreeDigitSubsequence(currentNum, inputSequence)) {
            totalFoundCombinations++;
        }
    }

    console.log(totalFoundCombinations);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
