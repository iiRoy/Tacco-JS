const fileSystemModule = require('node:fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = standardInputContent.split('\n');

const initialTextValue = processedInputLines[0];
const initialNumericModifier = Number.parseInt(processedInputLines[1], 10);

if (initialTextValue.length === 0) {
    process.stdout.write('\n');
    return;
}

const finalCharacterOfText = initialTextValue.at(-1);
const leadingCharactersOfText = initialTextValue.slice(0, -1);

const processingOutcome = leadingCharactersOfText.split('').reduce((currentState, currentSymbol) => {
    const symbolNumericalValue = currentSymbol.codePointAt(0);
    const costToShiftToA = 123 - symbolNumericalValue;

    if (currentSymbol !== 'a' && currentState.remainingModifier >= costToShiftToA) {
        return {
            accumulatedString: currentState.accumulatedString + 'a',
            remainingModifier: currentState.remainingModifier - costToShiftToA
        };
    } else {
        return {
            accumulatedString: currentState.accumulatedString + currentSymbol,
            remainingModifier: currentState.remainingModifier
        };
    }
}, { accumulatedString: '', remainingModifier: initialNumericModifier });

const finalModifierValue = processingOutcome.remainingModifier;
const resultingLeadingSequence = processingOutcome.accumulatedString;

const finalSymbolCodePoint = finalCharacterOfText.codePointAt(0);
const effectiveLastCharacterShift = finalModifierValue % 26;

let transformedFinalSymbolCode = finalSymbolCodePoint + effectiveLastCharacterShift;

if (transformedFinalSymbolCode > 122) { // 'z' is 122
    transformedFinalSymbolCode -= 26;
}

const transformedFinalSymbol = String.fromCodePoint(transformedFinalSymbolCode);

const finalConstructedResult = resultingLeadingSequence + transformedFinalSymbol;

process.stdout.write(finalConstructedResult + '\n');