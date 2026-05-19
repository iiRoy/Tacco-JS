function myout(text){console.log(text);}
function Main(programInput) {
    const inputLines = programInput.trim().split("\n");
    const sequenceLength = parseInt(inputLines[0]);
    const charSequence = inputLines[1];

    const totalEastChars = charSequence.split('').filter(c => c === 'E').length;

    // The initial minimum cost is if the leader is at index 0.
    // W's to the left of index 0: 0
    // E's to the right of index 0: totalEastChars
    // So, the initial minimum is totalEastChars.

    // The accumulator object for reduce will hold:
    //   - minCost: The minimum number of direction changes found so far.
    //   - westCountBefore: The count of 'W' characters encountered *before* the current character (char at 'index').
    //   - eastCountAfter: The count of 'E' characters from the current character ('char' at 'index') to the end of the sequence.
    const finalResult = charSequence.split('').reduce((accumulator, currentChar, currentIndex) => {
        // Calculate the cost if the leader is at 'currentIndex'.
        // W's to the left of 'currentIndex' is 'accumulator.westCountBefore'.
        // E's to the right of 'currentIndex' is 'accumulator.eastCountAfter' minus 1 if 'currentChar' is 'E' (because 'currentChar' is not to the right of itself).
        const currentCost = accumulator.westCountBefore + (accumulator.eastCountAfter - (currentChar === 'E' ? 1 : 0));

        // Update the overall minimum cost.
        accumulator.minCost = Math.min(accumulator.minCost, currentCost);

        // Prepare counts for the *next* iteration (for 'currentIndex + 1').
        if (currentChar === 'W') {
            accumulator.westCountBefore++;
        } else { // currentChar === 'E'
            accumulator.eastCountAfter--;
        }
        return accumulator;
    }, { minCost: totalEastChars, westCountBefore: 0, eastCountAfter: totalEastChars });

    myout(finalResult.minCost);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
