'use strict';

const processInput = (dataString) => {
    const [firstWord, secondWord, thirdWord] = dataString.split('\n')[0].split(' ');

    const comparisonResults = [
        firstWord.charAt(firstWord.length - 1) === secondWord.charAt(0),
        secondWord.charAt(secondWord.length - 1) === thirdWord.charAt(0)
    ];

    const finalDecision = comparisonResults.every(conditionMet => conditionMet);

    console.log(finalDecision ? "YES" : "NO");
};

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
