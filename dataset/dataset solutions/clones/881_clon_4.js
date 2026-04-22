const fileOps = require('fs');

const createRepeatedString = (countValue, characterToRepeat) =>
  characterToRepeat.repeat(countValue);

const entireInputContent = fileOps.readFileSync(0, 'utf8');
const linesOfText = entireInputContent.split('\n');
const designatedInput = linesOfText[0];

function executeConversion() {
  const initialBrainfuckSegment = '>++++++[<+++++>-]<[>+>+>+>++>++>++>+++>+++>+++>++++<<<<<<<<<<-]>';
  const initialMemoryValues = [30, 30, 30, 60, 60, 60, 90, 90, 90, 120];

  const processingResult = Array.from(designatedInput).reduce((accumulator, currentCharacter) => {
    const charCode = currentCharacter.charCodeAt(0);
    const targetBinIndex = Math.floor((charCode - 33) / 11);

    const pointerDifference = targetBinIndex - accumulator.currentPointerPosition;
    const pointerMovementCount = Math.abs(pointerDifference);
    const pointerDirectionSymbol = (pointerDifference > 0) ? '>' : '<';
    accumulator.resultString += createRepeatedString(pointerMovementCount, pointerDirectionSymbol);

    const valueDifference = charCode - accumulator.cellStateArray[targetBinIndex];
    const valueModificationSymbol = (valueDifference > 0) ? '+' : '-';
    const absoluteValueDifference = Math.abs(valueDifference);
    accumulator.resultString += createRepeatedString(absoluteValueDifference, valueModificationSymbol);

    accumulator.resultString += '.';

    accumulator.cellStateArray[targetBinIndex] = charCode;
    accumulator.currentPointerPosition = targetBinIndex;

    return accumulator;
  }, {
    resultString: initialBrainfuckSegment,
    currentPointerPosition: 0,
    cellStateArray: [...initialMemoryValues]
  });

  console.log(processingResult.resultString);
}

executeConversion();