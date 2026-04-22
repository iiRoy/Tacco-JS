class DataProcessorUnit {
  static performCalculation(rawTextualData) {
    let firstComponentString;
    let secondComponentString;

    const initialSpaceIndex = rawTextualData.indexOf(' ');

    if (initialSpaceIndex === -1) {
      firstComponentString = rawTextualData;
      secondComponentString = undefined;
    } else {
      firstComponentString = rawTextualData.substring(0, initialSpaceIndex);
      const afterFirstSpaceString = rawTextualData.substring(initialSpaceIndex + 1);
      const secondSpaceIndex = afterFirstSpaceString.indexOf(' ');

      if (secondSpaceIndex === -1) {
        secondComponentString = afterFirstSpaceString;
      } else {
        secondComponentString = afterFirstSpaceString.substring(0, secondSpaceIndex);
      }
    }

    const operandA = Number(firstComponentString);
    const operandB = Number(secondComponentString);

    return operandA / operandB;
  }
}

const dataAcquisition = require('node:fs');
const receivedPayload = dataAcquisition.readFileSync('/dev/stdin', 'utf8');

const outcome = DataProcessorUnit.performCalculation(receivedPayload);

process.stdout.write(outcome.toString() + '\n');