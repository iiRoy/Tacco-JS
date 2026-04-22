const stdioReader = require('node:fs');

const cyclicalShift = (inputStr, displacement) => {
  if (inputStr.length === 0) return '';
  const normalizedDisplacement = displacement % inputStr.length;
  if (normalizedDisplacement === 0) return inputStr;
  const effectiveDisplacement = normalizedDisplacement < 0
    ? inputStr.length + normalizedDisplacement
    : normalizedDisplacement;

  const charArray = Array.from(inputStr);
  const shiftedPart = charArray.splice(0, effectiveDisplacement);
  return charArray.concat(shiftedPart).join('');
};

function* instructionParser(inputData) {
  const dataUnits = inputData.trim().split('\n');
  if (dataUnits.length === 0) return;

  let unitPointer = 0;

  yield { kind: 'initial_sequence', payload: dataUnits[unitPointer++] };

  while (unitPointer < dataUnits.length) {
    const currentUnitValue = dataUnits[unitPointer];
    const numericalValue = parseInt(currentUnitValue, 10);

    if (!isNaN(numericalValue)) {
      yield { kind: 'shift_operation', payload: numericalValue };
      unitPointer++;
    } else {
      yield { kind: 'capture_and_reset', payload: currentUnitValue };
      unitPointer += 2;
    }
  }
}

const rawInput = stdioReader.readFileSync('/dev/stdin', 'utf8');
const processedOutputs = [];
let currentWorkingSequence = '';

for (const instruction of instructionParser(rawInput)) {
  switch (instruction.kind) {
    case 'initial_sequence':
      currentWorkingSequence = instruction.payload;
      break;
    case 'shift_operation':
      currentWorkingSequence = cyclicalShift(currentWorkingSequence, instruction.payload);
      break;
    case 'capture_and_reset':
      processedOutputs.push(currentWorkingSequence);
      currentWorkingSequence = instruction.payload;
      break;
  }
}

console.log(processedOutputs.join('\n'));