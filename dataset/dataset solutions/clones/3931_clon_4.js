const charOffset = 'a'.charCodeAt(0);

const toCode = (char) => char.charCodeAt(0) - charOffset;
const fromCode = (code) => String.fromCharCode(code + charOffset);

function processInputString(inputString) {
    const stringLength = inputString.length;
    let outputString;

    if (stringLength < 26) {
        const presentCodes = new Set(Array.from(inputString).map(toCode));
        const firstMissingCode = Array.from({ length: 26 }, (_, codeValue) => codeValue)
                                      .find(codeValue => !presentCodes.has(codeValue));
        outputString = inputString + fromCode(firstMissingCode);
    } else {
        const reversedAlphabet = Array.from({ length: 26 }, (_, idx) => fromCode(25 - idx)).join('');
        if (inputString === reversedAlphabet) {
            console.log(-1);
            return;
        }

        const initialSeenCodes = new Set([toCode(inputString[stringLength - 1])]);

        const finalState = Array.from(inputString.slice(0, -1)).reduceRight((accumulator, currentCharacter, relativeIndex) => {
            if (accumulator.found) return accumulator;

            const originalIndex = relativeIndex;
            const characterCodeAtCurrentIndex = toCode(currentCharacter);

            const potentialReplacementCode = Array.from({ length: 26 - characterCodeAtCurrentIndex }, (_, offset) => characterCodeAtCurrentIndex + offset)
                                                 .find(codeCandidate => accumulator.seenCodes.has(codeCandidate));

            if (potentialReplacementCode !== undefined) {
                accumulator.prefix = inputString.substring(0, originalIndex);
                accumulator.replacementCharacter = fromCode(potentialReplacementCode);
                accumulator.found = true;
            }

            accumulator.seenCodes.add(characterCodeAtCurrentIndex);
            return accumulator;
        }, { seenCodes: initialSeenCodes, found: false, prefix: '', replacementCharacter: '' });

        outputString = finalState.prefix + finalState.replacementCharacter;
    }
    console.log(outputString);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8").trim());
