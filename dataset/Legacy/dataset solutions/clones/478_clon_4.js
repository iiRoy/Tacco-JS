const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = sourceData.trim().split("\n");

const fizzBuzzEvaluator = (numeral) => {
    const rules = [
        { divisor: 15, phrase: "FizzBuzz" },
        { divisor: 3, phrase: "Fizz" },
        { divisor: 5, phrase: "Buzz" }
    ];

    for (const rule of rules) {
        if (numeral % rule.divisor === 0) {
            return rule.phrase;
        }
    }
    return String(numeral);
};

while (true) {
    const gameParams = lineSegments.shift().split(" ");
    if (gameParams[0] === "0" && gameParams[1] === "0") {
        break;
    }

    const playerCount = Number(gameParams[0]);
    const roundLimit = Number(gameParams[1]);

    let activePlayerIndices = Array.from({ length: playerCount }, (_, idx) => idx);
    let currentSpeakerIndex = 0; // Index into the activePlayerIndices array
    let roundNumber = 0; // The number for FizzBuzz calculation

    for (let r = 0; r < roundLimit; r++) {
        if (activePlayerIndices.length <= 1) {
            break; 
        }

        roundNumber++;
        const spokenPhrase = lineSegments.shift();
        const expectedPhrase = fizzBuzzEvaluator(roundNumber);

        if (spokenPhrase !== expectedPhrase) {
            // Player at currentSpeakerIndex made a mistake, eliminate them
            activePlayerIndices.splice(currentSpeakerIndex, 1);
            
            if (activePlayerIndices.length === 0) {
                // All players eliminated, game ends
                break; 
            }
            // Adjust currentSpeakerIndex if the last element was removed,
            // otherwise it now points to the next player in the sequence.
            currentSpeakerIndex %= activePlayerIndices.length;
        }
        
        // Advance to the next speaker for the *next* round,
        // unless this is the very last round of the game.
        if (r < roundLimit - 1) {
            currentSpeakerIndex = (currentSpeakerIndex + 1) % activePlayerIndices.length;
        }
    }

    const finalists = activePlayerIndices.map(playerIdx => playerIdx + 1);
    console.log(finalists.join(" "));
}
