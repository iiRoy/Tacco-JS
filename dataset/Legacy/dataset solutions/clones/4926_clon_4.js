const fileSystem = require("fs");

const determineScore = (inputString) => {
    const initialValues = { currentScore: 0, currentBalance: 0 };

    const processCharacter = (accumulator, character) => {
        let { currentScore, currentBalance } = accumulator;

        const isMatchAndAvailable = currentBalance > 0 && character === 'g';

        const scoreAdjustment = (isMatchAndAvailable)
            ? 1
            : (character === 'p' ? -1 : 0);

        const balanceAdjustment = (isMatchAndAvailable)
            ? -1
            : 1;

        return {
            currentScore: currentScore + scoreAdjustment,
            currentBalance: currentBalance + balanceAdjustment
        };
    };

    const finalResult = inputString.split('').reduce(processCharacter, initialValues);

    console.log(finalResult.currentScore);
};

const inputData = fileSystem.readFileSync("/dev/stdin", "UTF-8");
const firstLine = inputData.split("\n")[0];
determineScore(firstLine);
