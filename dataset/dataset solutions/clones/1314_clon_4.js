(function(rawText) {
    const alphabetStartCode = 'a'.charCodeAt(0);
    const alphabetEndCode = 'z'.charCodeAt(0);

    // Establish a default frequency registry for all lowercase alphabet characters
    const initialLetterTally = Array.from({ length: alphabetEndCode - alphabetStartCode + 1 }, (_, index) =>
        String.fromCharCode(alphabetStartCode + index)
    ).reduce((accumulatorMap, currentLetter) => {
        accumulatorMap.set(currentLetter, 0);
        return accumulatorMap;
    }, new Map());

    // Iterate through the input text to calculate character frequencies
    const finalLetterTally = Array.from(rawText).reduce((currentTally, chr) => {
        const normalizedChr = chr.toLowerCase();
        const chrCode = normalizedChr.charCodeAt(0);

        // Increment count only for valid lowercase English letters
        if (chrCode >= alphabetStartCode && chrCode <= alphabetEndCode) {
            currentTally.set(normalizedChr, currentTally.get(normalizedChr) + 1);
        }
        return currentTally;
    }, initialLetterTally); // Begin counting from the pre-populated map

    // Assemble the formatted output lines
    const resultFragments = [];
    for (const [charKey, finalCount] of finalLetterTally.entries()) {
        resultFragments.push(`${charKey} : ${finalCount}`);
    }

    // Display the final frequency report
    console.log(resultFragments.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));