function processInputData(rawData) {
    const cleanedContent = rawData.trim();
    const contentTokens = cleanedContent.split(/\s+/);

    const countIndicator = contentTokens.shift(); // Corresponds to original 'A'
    const numericalSequence = contentTokens.map(Number); // Corresponds to original 'input[i]' values

    const categoryTallies = numericalSequence.reduce((accumulator, currentNumber) => {
        if (currentNumber % 4 === 0) {
            accumulator.multiplesOfFour++;
        } else if (currentNumber % 2 === 0) {
            accumulator.evenButNotFour++;
        } else {
            accumulator.oddNumbers++;
        }
        return accumulator;
    }, { multiplesOfFour: 0, evenButNotFour: 0, oddNumbers: 0 });

    const { multiplesOfFour, evenButNotFour, oddNumbers } = categoryTallies;

    const finalVerdict = (oddNumbers <= multiplesOfFour) ||
                         (oddNumbers === multiplesOfFour + 1 && evenButNotFour === 0);

    console.log(finalVerdict ? "Yes" : "No");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
