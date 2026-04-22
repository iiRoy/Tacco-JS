const computeMagnitude = (incomingSignal) => (
  [
    (signalPart) => signalPart.replace(/^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g, ''),
    (strippedContent) => {
      let currentIdx = 0;
      let numericSign = 1;
      if (strippedContent.length === 0) {
        return NaN;
      }

      if (strippedContent[0] === '-') {
        numericSign = -1;
        currentIdx++;
      } else if (strippedContent[0] === '+') {
        currentIdx++;
      }

      let accumulatedValue = 0;
      let digitFound = false;
      while (currentIdx < strippedContent.length) {
        const characterCode = strippedContent.charCodeAt(currentIdx);
        if (characterCode >= 48 && characterCode <= 57) {
          accumulatedValue = accumulatedValue * 10 + (characterCode - 48);
          digitFound = true;
        } else {
          break;
        }
        currentIdx++;
      }
      if (!digitFound) {
        return NaN;
      }
      return accumulatedValue * numericSign;
    },
    (numericalBase) => [numericalBase, numericalBase].reduce((accumulator, element) => accumulator * element, 1)
  ].reduce((currentPayload, operation) => operation(currentPayload), incomingSignal)
);

console.log(computeMagnitude(require('fs').readFileSync('/dev/stdin', 'utf8')));