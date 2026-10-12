const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

let dataCursor = 0;
const acquireNextEntry = () => {
    if (dataCursor >= sourceData.length) {
        throw "NoSuchElementException:次に要素は無いよ";
    }
    return sourceData[dataCursor++];
};

const displayOutput = (content) => console.log(content);
const displayError = (content) => console.error(content);

const processSequence = () => {
    const currentSequence = acquireNextEntry();

    if (currentSequence.length < 26) {
        const presentCharacters = new Set(currentSequence.split(''));

        const completeAlphabet = Array.from({ length: 26 }, (_, charIdx) => String.fromCharCode(97 + charIdx));

        const diagnosticSnapshot = completeAlphabet.map(charItem => presentCharacters.has(charItem) ? "" : charItem);
        displayError(diagnosticSnapshot);

        let appendedCharacter = '';
        for (let i = 0; i < completeAlphabet.length; i++) {
            if (!presentCharacters.has(completeAlphabet[i])) {
                appendedCharacter = completeAlphabet[i];
                break;
            }
        }
        displayOutput(currentSequence + appendedCharacter);

    } else {
        if (currentSequence === "zyxwvutsrqponmlkjihgfedcba") {
            displayOutput(-1);
        } else {
            // No operation for other 26-character strings or longer strings.
        }
    }
};

processSequence();
