const processInput = (rawContent) => {
    const lines = rawContent.trim().split('\n');
    let lineCursor = 0;

    const gameIterator = function* () {
        while (true) {
            const configLine = lines[lineCursor++].split(' ').map(Number);
            const [playerCount, roundCount] = configLine;

            if (playerCount === 0 && roundCount === 0) {
                break;
            }

            const roundAnswers = [];
            for (let k = 0; k < roundCount; k++) {
                roundAnswers.push(lines[lineCursor++]);
            }
            yield { playerCount, roundCount, roundAnswers };
        }
    };

    return gameIterator();
};

const calculateFizzBuzz = (numberValue) => {
    const isDivisibleBy3 = numberValue % 3 === 0;
    const isDivisibleBy5 = numberValue % 5 === 0;

    return (isDivisibleBy3 && isDivisibleBy5) ? "FizzBuzz" :
           (isDivisibleBy3) ? "Fizz" :
           (isDivisibleBy5) ? "Buzz" :
           String(numberValue);
};

const executeGameRound = ({ playerCount, roundCount, roundAnswers }) => {
    let activePlayerSet = new Set(Array.from({ length: playerCount }, (_, idx) => idx));
    let currentTurnPlayer = 0;
    let currentCallNumber = 0;

    for (let roundIndex = 0; roundIndex < roundCount; roundIndex++) {
        currentCallNumber++;

        if (activePlayerSet.size === 0) {
            break;
        }

        while (!activePlayerSet.has(currentTurnPlayer)) {
            currentTurnPlayer = (currentTurnPlayer + 1) % playerCount;
        }

        const correctResponse = calculateFizzBuzz(currentCallNumber);
        const playerResponse = roundAnswers[roundIndex];

        if (correctResponse !== playerResponse) {
            activePlayerSet.delete(currentTurnPlayer);
        }

        currentTurnPlayer = (currentTurnPlayer + 1) % playerCount;
    }

    return Array.from(activePlayerSet)
                .sort((a, b) => a - b)
                .map(playerIdx => playerIdx + 1)
                .join(" ");
};

const main = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const gameDataGenerator = processInput(fileContent);
    const gameOutcomes = [];

    for (const gameConfiguration of gameDataGenerator) {
        gameOutcomes.push(executeGameRound(gameConfiguration));
    }

    console.log(gameOutcomes.join('\n'));
};

main();
